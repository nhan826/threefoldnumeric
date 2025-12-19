import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

/**
 * OverflowUnderflowChart
 * Visualizes overflow and underflow regions for a given numeric system.
 * Props:
 *   system: { name: string, min: number, max: number }
 */
export default function OverflowUnderflowChart({ system, width = 480, height = 220 }) {
  const ref = useRef();

  useEffect(() => {
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    // X scale: log for wide range
    const x = d3.scaleLog()
      .domain([system.min / 10, system.max * 10])
      .range([margin.left, width - margin.right]);

    // Y scale: just a band for visual effect
    const y = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);

    // Draw SVG with viewBox for responsiveness
    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    // Draw axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(8, d3.format('.0e')))
      .selectAll('text')
      .style('fill', '#b0eaff');

    // Draw overflow region
    svg.append('rect')
      .attr('x', x(system.max))
      .attr('y', y(1))
      .attr('width', x(system.max * 10) - x(system.max))
      .attr('height', y(0) - y(1))
      .attr('fill', 'rgba(255, 80, 80, 0.25)');
    svg.append('text')
      .attr('x', x(system.max * 2.5))
      .attr('y', y(0.5))
      .attr('fill', '#ff5050')
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .text('Overflow');

    // Draw underflow region
    svg.append('rect')
      .attr('x', x(system.min / 10))
      .attr('y', y(1))
      .attr('width', x(system.min) - x(system.min / 10))
      .attr('height', y(0) - y(1))
      .attr('fill', 'rgba(80, 180, 255, 0.22)');
    svg.append('text')
      .attr('x', x(system.min / 2.5))
      .attr('y', y(0.5))
      .attr('fill', '#50baff')
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .text('Underflow');

    // Draw representable region
    svg.append('rect')
      .attr('x', x(system.min))
      .attr('y', y(1))
      .attr('width', x(system.max) - x(system.min))
      .attr('height', y(0) - y(1))
      .attr('fill', 'rgba(255,255,255,0.10)')
      .attr('stroke', '#b0eaff')
      .attr('stroke-width', 1.5);
    svg.append('text')
      .attr('x', x(Math.sqrt(system.min * system.max)))
      .attr('y', y(0.2))
      .attr('fill', '#b0eaff')
      .attr('font-size', 13)
      .attr('text-anchor', 'middle')
      .text('Representable Range');
  }, [system]);

  return (
    <div className="frosted-glass p-4 rounded-xl shadow-lg w-full">
      <h3 className="text-lg font-semibold mb-2 text-cyan-100">Overflow & Underflow</h3>
      <svg ref={ref} />
      <div className="text-xs text-cyan-200 mt-2 flex flex-wrap gap-3">
        <span><span className="inline-block w-3 h-3 rounded-full align-middle mr-1" style={{background:'#ff5050',opacity:0.5}}></span>Overflow</span>
        <span><span className="inline-block w-3 h-3 rounded-full align-middle mr-1" style={{background:'#50baff',opacity:0.5}}></span>Underflow</span>
        <span><span className="inline-block w-3 h-3 rounded-full align-middle mr-1" style={{background:'#b0eaff',opacity:0.3}}></span>Representable</span>
      </div>
    </div>
  );
}
