import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { useNumeric } from '../context/NumericContext'

// Simulate repeated MAC error accumulation for a given backend
function simulateAccumError(backend, n = 1000) {
  let sum = 0
  let ref = 0
  let errors = []
  for (let i = 0; i < n; i++) {
    const a = 1 + Math.sin(i) * 0.01 // small variation
    const b = 1 - Math.cos(i) * 0.01
    ref += a * b
    sum = backend.accumulate(sum, backend.multiply(a, b))
    errors.push({ step: i + 1, absErr: Math.abs(sum - ref), relErr: Math.abs((sum - ref) / ref) })
  }
  return errors
}

export default function AccumulationErrorChart({ width = 800, height = 320 }) {
  const ref = useRef()
  const { selected } = useNumeric()

  useEffect(() => {
    const backend = selected.implementation
    const data = simulateAccumError(backend, 1000)
    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    d3.select(ref.current).selectAll('*').remove()
    const svg = d3.select(ref.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
    const x = d3.scaleLinear().domain([1, data.length]).range([0, w])
    const y = d3.scaleLog().domain([1e-16, d3.max(data, d => Math.max(d.absErr, 1e-16))]).range([h, 0])
    const xAxis = d3.axisBottom(x).ticks(10)
    const yAxis = d3.axisLeft(y).ticks(6, d3.format('.0e'))
    g.append('g').attr('transform', `translate(0,${h})`).call(xAxis)
    g.append('g').call(yAxis)

    // line
    const line = d3.line()
      .x(d => x(d.step))
      .y(d => y(Math.max(d.absErr, 1e-16)))
      .curve(d3.curveMonotoneX)
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#f59e42')
      .attr('stroke-width', 2)
      .attr('d', line)

    // label
    svg.append('text').attr('x', margin.left + w / 2).attr('y', 18).attr('text-anchor', 'middle').attr('fill', '#cbd5e1').text('Accumulated error over repeated MACs')
    svg.append('text').attr('x', margin.left + w / 2).attr('y', height - 6).attr('text-anchor', 'middle').attr('fill', '#9ca3af').text('steps')
    svg.append('text').attr('transform', `translate(12, ${margin.top + h / 2}) rotate(-90)`).attr('text-anchor', 'middle').attr('fill', '#9ca3af').text('absolute error (log)')
  }, [selected, width, height])

  return (
    <svg ref={ref} width={width} height={height} className="w-full h-auto" />
  )
}
