import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { useNumeric } from '../context/NumericContext'
import { computeRelULP } from '../numeric/simulate'

function generateData(backend, points = 200) {
  // sample magnitudes from 1e-8 to 1e8 logarithmically
  const min = -8
  const max = 8
  const data = []
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1)
    const exp = min + t * (max - min)
    const x = Math.pow(10, exp)
    const q = backend.quantize(x)
    const rel = Math.abs((q - x) / x)
    data.push({ x, rel })
  }
  return data
}

export default function RelativeErrorChart({ width = 800, height = 320 }) {
  const ref = useRef()
  const { selected } = useNumeric()

  useEffect(() => {
    const backend = selected.implementation
    const data = generateData(backend, 300)

    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    d3.select(ref.current).selectAll('*').remove()
    const svg = d3.select(ref.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLog().domain(d3.extent(data, d => d.x)).range([0, w])
    const y = d3.scaleLog().domain([1e-16, d3.max(data, d => Math.max(d.rel, 1e-16))]).range([h, 0])

    const xAxis = d3.axisBottom(x).ticks(10, d3.format('.0e'))
    const yAxis = d3.axisLeft(y).ticks(6, d3.format('.0e'))

    g.append('g').attr('transform', `translate(0,${h})`).call(xAxis)
    g.append('g').call(yAxis)

    // line
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(Math.max(d.rel, 1e-16)))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#60a5fa')
      .attr('stroke-width', 2)
      .attr('d', line)

    // ULP overlay (per-sample ±1 ULP band)
    try {
      const minRel = 1e-16
      const eBits = backend.exponentBits || 8
      const mBits = backend.mantissaBits || 10
      const areaData = data.map(d => ({ x: d.x, rel: d.rel, relUlp: computeRelULP(d.x, eBits, mBits) }))

      const areaGen = d3.area()
        .x(d => x(d.x))
        .y0(d => y(Math.max(d.rel - d.relUlp, minRel)))
        .y1(d => y(Math.max(d.rel + d.relUlp, minRel)))
        .curve(d3.curveMonotoneX)

      // area path with transition if exists
      const areaPath = g.selectAll('.ulp-area').data([areaData])
      areaPath.join(
        enter => enter.append('path').attr('class', 'ulp-area').attr('fill', '#f9731640').attr('stroke', 'none').attr('d', areaGen),
        update => update.transition().duration(600).attr('d', areaGen),
        exit => exit.remove()
      )

      // central marker line
      const markerY = Math.pow(2, -mBits)
      const lineSel = g.selectAll('.ulp-line').data([markerY])
      lineSel.join(
        enter => enter.append('line').attr('class', 'ulp-line').attr('x1', 0).attr('x2', w).attr('y1', y(markerY)).attr('y2', y(markerY)).attr('stroke', '#f97316').attr('stroke-dasharray', '4 4').attr('stroke-width', 1),
        update => update.transition().duration(600).attr('y1', y(markerY)).attr('y2', y(markerY)),
        exit => exit.remove()
      )

      const txtSel = g.selectAll('.ulp-text').data([markerY])
      txtSel.join(
        enter => enter.append('text').attr('class', 'ulp-text').attr('x', w - 4).attr('y', y(markerY) - 6).attr('text-anchor', 'end').attr('fill', '#f97316').style('font-size', '10px').text(`~1 ULP (mantissa ${mBits})`),
        update => update.transition().duration(600).attr('y', y(markerY) - 6).text(`~1 ULP (mantissa ${mBits})`),
        exit => exit.remove()
      )
    } catch (e) {
      // ignore if backend missing properties
    }

    // tooltip/focus
    const bisect = d3.bisector(d => d.x).left
    const focus = g.append('g').style('display', 'none')
    focus.append('circle').attr('r', 4).attr('fill', '#fff').attr('stroke', '#60a5fa').attr('stroke-width', 2)

    const tooltip = svg.append('g').attr('class', 'tooltip').style('display', 'none')
    tooltip.append('rect').attr('width', 190).attr('height', 64).attr('rx', 6).attr('fill', '#0f1720').attr('opacity', 0.95)
    const t1 = tooltip.append('text').attr('x', 8).attr('y', 18).attr('fill', '#e6eef3').style('font-size', '12px')
    const t2 = tooltip.append('text').attr('x', 8).attr('y', 34).attr('fill', '#9ca3af').style('font-size', '11px')
    const t3 = tooltip.append('text').attr('x', 8).attr('y', 50).attr('fill', '#9ca3af').style('font-size', '11px')

    svg.append('rect')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('width', w)
      .attr('height', h)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mousemove', function (event) {
        const [mx, my] = d3.pointer(event)
        const xm = x.invert(mx - margin.left)
        const i = bisect(data, xm)
        const d0 = data[i - 1]
        const d1 = data[i]
        const d = (!d0 || (d1 && Math.abs(d1.x - xm) < Math.abs(d0.x - xm))) ? d1 : d0
        if (!d) return
        const px = x(d.x)
        const py = y(Math.max(d.rel, 1e-16))
        focus.attr('transform', `translate(${px},${py})`).style('display', null)

        const globalX = margin.left + px
        const globalY = margin.top + py
        tooltip.style('display', null).attr('transform', `translate(${globalX + 12}, ${globalY - 20})`)
        t1.text(`mag: ${d.x.toExponential(2)}`)
        t2.text(`rel err: ${d.rel.toExponential(2)}`)
        t3.text(`quantized: ${backend.quantize(d.x).toExponential(2)}`)
      })
      .on('mouseout', function () {
        focus.style('display', 'none')
        tooltip.style('display', 'none')
      })

    // Mark subnormal region and negative-note
    try {
      const exponentBits = backend.exponentBits || 8
      const bias = Math.pow(2, exponentBits - 1) - 1
      const minNormalExp = 1 - bias
      const minNormal = Math.pow(2, minNormalExp)
      const x0 = x.domain()[0]
      // draw shaded rect for subnormal region (values < minNormal)
      if (minNormal > 0 && minNormal > x0) {
        const sx = x(minNormal)
        g.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', Math.max(0, sx))
          .attr('height', h)
          .attr('fill', '#052f3a')
          .attr('opacity', 0.12)

        svg.append('text')
          .attr('x', margin.left + Math.max(8, sx / 2))
          .attr('y', margin.top + 14)
          .attr('fill', '#9ca3af')
          .style('font-size', '11px')
          .text('Subnormal region')
      }
      // note about negatives
      svg.append('text')
        .attr('x', margin.left + 8)
        .attr('y', margin.top + h + 30)
        .attr('fill', '#9ca3af')
        .style('font-size', '11px')
        .text('Chart uses absolute magnitude; negative values mirror these behaviors (sign preserved)')
    } catch (e) {
      // ignore
    }

  // labels
    svg.append('text').attr('x', margin.left + w / 2).attr('y', 14).attr('text-anchor', 'middle').attr('fill', '#cbd5e1').text(`Relative error vs magnitude — ${selected.name}`)
    svg.append('text').attr('x', margin.left + w / 2).attr('y', height - 6).attr('text-anchor', 'middle').attr('fill', '#9ca3af').text('magnitude (log10)')
    svg.append('text').attr('transform', `translate(12, ${margin.top + h / 2}) rotate(-90)`).attr('text-anchor', 'middle').attr('fill', '#9ca3af').text('relative error (log)')

    // Keyboard accessibility: allow left/right arrows to move focus along sampled points
    let keyIdx = 0
    function focusAtIndex(i) {
      const d = data[Math.max(0, Math.min(data.length - 1, i))]
      if (!d) return
      const px = x(d.x)
      const py = y(Math.max(d.rel, 1e-16))
      focus.attr('transform', `translate(${px},${py})`).style('display', null)
      const globalX = margin.left + px
      const globalY = margin.top + py
      tooltip.style('display', null).attr('transform', `translate(${globalX + 12}, ${globalY - 20})`)
      t1.text(`mag: ${d.x.toExponential(2)}`)
      t2.text(`rel err: ${d.rel.toExponential(2)}`)
      t3.text(`quantized: ${backend.quantize(d.x).toExponential(2)}`)
    }

    function onKey(e) {
      if (e.key === 'ArrowRight') {
        keyIdx = Math.min(data.length - 1, keyIdx + 1)
        focusAtIndex(keyIdx)
      } else if (e.key === 'ArrowLeft') {
        keyIdx = Math.max(0, keyIdx - 1)
        focusAtIndex(keyIdx)
      }
    }
    window.addEventListener('keydown', onKey)

    // cleanup on unmount
    return () => {
      window.removeEventListener('keydown', onKey)
    }

  }, [selected, width, height])

  return (
    <div className="p-4">
      <svg ref={ref} className="w-full h-auto" />
    </div>
  )
}
