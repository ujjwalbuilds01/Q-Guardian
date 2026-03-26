import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * QuantumShadow — D3-powered Harvest-Now-Decrypt-Later Timeline
 *
 * Each asset is a horizontal bar spanning from "data intercepted today"
 * to "data becomes decryptable at CRQC arrival", with a glowing pulse
 * on the overlap zone where both conditions are true.
 */
const QuantumShadow = ({ cbom, crqcYear = 2031 }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (!cbom || cbom.length === 0 || !d3Container.current) return;

        d3.select(d3Container.current).selectAll('*').remove();

        const margin = { top: 30, right: 30, bottom: 40, left: 200 };
        const barHeight = 36;
        const barGap = 12;
        const width = 700 - margin.left - margin.right;
        const height = cbom.length * (barHeight + barGap) + margin.top + margin.bottom;

        const svg = d3.select(d3Container.current)
            .append('svg')
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('width', '100%')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const currentYear = 2024;
        const endYear = Math.max(crqcYear + 5, 2042);

        // X scale (years)
        const x = d3.scaleLinear()
            .domain([currentYear, endYear])
            .range([0, width]);

        const xAxis = d3.axisBottom(x).tickFormat(d3.format("d")).ticks(8);
        svg.append('g')
            .attr('transform', `translate(0,${cbom.length * (barHeight + barGap)})`)
            .call(xAxis)
            .selectAll('text').attr('fill', 'var(--text-secondary)').style('font-size', '11px').style('font-family', 'Inter, sans-serif');
        svg.selectAll('.domain').attr('stroke', 'var(--border-color)');
        svg.selectAll('.tick line').attr('stroke', 'var(--border-color)');

        // CRQC arrival line
        svg.append('line')
            .attr('x1', x(crqcYear))
            .attr('x2', x(crqcYear))
            .attr('y1', -10)
            .attr('y2', cbom.length * (barHeight + barGap) + 5)
            .attr('stroke', 'var(--color-critical)')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '6,4');

        svg.append('text')
            .attr('x', x(crqcYear))
            .attr('y', -15)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--color-critical)')
            .style('font-size', '10px')
            .style('font-family', 'Inter, sans-serif')
            .style('font-weight', '600')
            .text(`CRQC ${crqcYear}`);

        // Gradient definition for the shadow glow
        const defs = svg.append('defs');

        // Pulsing glow filter
        const filter = defs.append('filter').attr('id', 'glow');
        filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
        filter.append('feMerge')
            .selectAll('feMergeNode')
            .data(['blur', 'SourceGraphic'])
            .enter()
            .append('feMergeNode')
            .attr('in', d => d);

        // Bars for each asset
        cbom.forEach((asset, i) => {
            const y = i * (barHeight + barGap);
            const migYears = (asset.estimated_migration_months || 12) / 12;
            const decryptYear = crqcYear;
            const harvestEnd = currentYear + migYears;

            // Background bar (full timeline)
            svg.append('rect')
                .attr('x', x(currentYear))
                .attr('y', y)
                .attr('width', x(endYear) - x(currentYear))
                .attr('height', barHeight)
                .attr('rx', 4)
                .attr('fill', 'var(--bg-surface-2)')
                .attr('stroke', 'var(--border-color)')
                .attr('stroke-width', 1);

            // Exposure window (from now until migration completes)
            svg.append('rect')
                .attr('x', x(currentYear))
                .attr('y', y)
                .attr('width', Math.max(0, x(harvestEnd) - x(currentYear)))
                .attr('height', barHeight)
                .attr('rx', 4)
                .attr('fill', 'var(--pnb-navy)')
                .attr('opacity', 0.15);

            // Critical overlap zone (exposure that overlaps with CRQC window)
            const overlapStart = Math.max(currentYear, decryptYear);
            if (harvestEnd > overlapStart) {
                const overlapEnd = Math.min(harvestEnd, endYear);
                if (overlapEnd > overlapStart) {
                    svg.append('rect')
                        .attr('x', x(overlapStart))
                        .attr('y', y + 4)
                        .attr('width', x(overlapEnd) - x(overlapStart))
                        .attr('height', barHeight - 8)
                        .attr('rx', 2)
                        .attr('fill', 'var(--color-critical)')
                        .attr('opacity', 0.6)
                        .attr('filter', 'url(#glow)');

                    svg.append('text')
                        .attr('x', x(overlapStart) + (x(overlapEnd) - x(overlapStart)) / 2)
                        .attr('y', y + barHeight / 2 + 3)
                        .attr('text-anchor', 'middle')
                        .attr('fill', 'white')
                        .style('font-size', '8px')
                        .style('font-weight', 'bold')
                        .style('font-family', 'Inter, sans-serif')
                        .text('HNDL');
                }
            }

            // Asset label
            svg.append('text')
                .attr('x', -15)
                .attr('y', y + barHeight / 2 + 4)
                .attr('text-anchor', 'end')
                .attr('fill', 'var(--text-primary)')
                .style('font-size', '10px')
                .style('font-family', 'Inter, sans-serif')
                .style('font-weight', '500')
                .text(asset.hostname?.split('.')[0] || 'Unknown');

            // Priority indicator (glowing dot)
            const priority = asset.target_priority || 'MEDIUM';
            const badgeColor = priority === 'CRITICAL' ? 'var(--color-critical)' : priority === 'HIGH' ? 'var(--color-warning)' : 'var(--border-color-soft)';

            svg.append('circle')
                .attr('cx', -10)
                .attr('cy', y + barHeight / 2)
                .attr('r', 3)
                .attr('fill', badgeColor)
                .attr('filter', priority === 'CRITICAL' ? 'url(#glow)' : null);
        });

    }, [cbom, crqcYear]);

    return (
        <div className="w-full overflow-x-auto">
            <div ref={d3Container} />
        </div>
    );
};

export default QuantumShadow;
