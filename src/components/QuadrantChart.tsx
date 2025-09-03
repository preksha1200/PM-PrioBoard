import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Idea, ScoringModel, ChartPoint, Quadrant } from '../types';
import { calculateMedians, getScoreQuartiles, getScoreColor, getIdeaStatus } from '../score';
import { cn } from '../utils/cn';

interface QuadrantChartProps {
  ideas: Idea[];
  model: ScoringModel;
  useMedians: boolean;
  fixedMedians?: { effort: number; impact: number };
  onUpdateIdea: (id: string, updates: Partial<Idea>) => void;
  onSelectIdea: (idea: Idea) => void;
  selectedIdea?: Idea | null;
  className?: string;
}

const QUADRANTS: Quadrant[] = [
  { label: 'Quick Wins', description: 'High Impact, Low Effort', position: { x: 'left', y: 'top' } },
  { label: 'Big Bets', description: 'High Impact, High Effort', position: { x: 'right', y: 'top' } },
  { label: 'Maybes', description: 'Low Impact, Low Effort', position: { x: 'left', y: 'bottom' } },
  { label: 'Time Sinks', description: 'Low Impact, High Effort', position: { x: 'right', y: 'bottom' } }
];

export function QuadrantChart({ 
  ideas, 
  model, 
  useMedians, 
  fixedMedians, 
  onUpdateIdea, 
  onSelectIdea, 
  selectedIdea,
  className 
}: QuadrantChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [isDragging, setIsDragging] = useState(false);

  // Filter valid ideas for chart
  const validIdeas = ideas.filter(idea => getIdeaStatus(idea, model) === 'valid');

  // Calculate medians or use fixed values
  const medians = useMedians 
    ? calculateMedians(validIdeas, model)
    : (fixedMedians || { effort: 1, impact: 1 });

  // Get score quartiles for color coding
  const quartiles = getScoreQuartiles(validIdeas, model);

  // Convert ideas to chart points
  const chartPoints: ChartPoint[] = validIdeas.map(idea => ({
    id: idea.id,
    x: idea.effort,
    y: idea.impact,
    size: model === 'RICE' ? (idea.reach || 100) : (idea.confidence * 1000),
    color: getScoreColor(idea.score || null, quartiles),
    idea
  }));

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // D3 chart rendering
  useEffect(() => {
    if (!svgRef.current || chartPoints.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) return;

    // Create scales
    const maxEffort = d3.max(chartPoints, d => d.x) || 5;
    const maxImpact = d3.max(chartPoints, d => d.y) || 3;
    
    const xScale = d3.scaleLinear()
      .domain([0, Math.max(maxEffort * 1.1, medians.effort * 2)])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, Math.max(maxImpact * 1.1, medians.impact * 1.5)])
      .range([height, 0]);

    const sizeScale = d3.scaleSqrt()
      .domain(d3.extent(chartPoints, d => d.size) as [number, number])
      .range([4, 20]);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add quadrant backgrounds
    const quadrantWidth = width / 2;
    const quadrantHeight = height / 2;
    const medianX = xScale(medians.effort);
    const medianY = yScale(medians.impact);

    // Quick Wins (top-left)
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', medianX)
      .attr('height', medianY)
      .attr('fill', 'var(--color-soft-blue)')
      .attr('opacity', 0.1);

    // Big Bets (top-right)
    g.append('rect')
      .attr('x', medianX)
      .attr('y', 0)
      .attr('width', width - medianX)
      .attr('height', medianY)
      .attr('fill', 'var(--color-primary-red)')
      .attr('opacity', 0.1);

    // Maybes (bottom-left)
    g.append('rect')
      .attr('x', 0)
      .attr('y', medianY)
      .attr('width', medianX)
      .attr('height', height - medianY)
      .attr('fill', 'var(--color-gray-300)')
      .attr('opacity', 0.1);

    // Time Sinks (bottom-right)
    g.append('rect')
      .attr('x', medianX)
      .attr('y', medianY)
      .attr('width', width - medianX)
      .attr('height', height - medianY)
      .attr('fill', 'var(--color-terracotta)')
      .attr('opacity', 0.1);

    // Add quadrant labels
    const labelOffset = 20;
    
    g.append('text')
      .attr('x', medianX / 2)
      .attr('y', labelOffset)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .attr('fill', 'var(--text-primary)')
      .text('🚀 Quick Wins');

    g.append('text')
      .attr('x', medianX + (width - medianX) / 2)
      .attr('y', labelOffset)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .attr('fill', 'var(--text-primary)')
      .text('🎯 Big Bets');

    g.append('text')
      .attr('x', medianX / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .attr('fill', 'var(--text-primary)')
      .text('🤔 Maybes');

    g.append('text')
      .attr('x', medianX + (width - medianX) / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .attr('fill', 'var(--text-primary)')
      .text('⚠️ Time Sinks');

    // Add median lines
    g.append('line')
      .attr('x1', medianX)
      .attr('x2', medianX)
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'var(--color-gray-500)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', medianY)
      .attr('y2', medianY)
      .attr('stroke', 'var(--color-gray-500)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => `${d}m`);
    
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => {
        const labels: Record<number, string> = {
          0.25: 'Tiny',
          0.5: 'Small',
          1: 'Medium',
          2: 'Large',
          3: 'Massive'
        };
        return labels[d as number] || d.toString();
      });

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', 'var(--text-primary)')
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text('Effort (person-months) →');

    g.append('g')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('fill', 'var(--text-primary)')
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text('← Impact');

    // Create tooltip
    const tooltip = d3.select('body')
      .selectAll('.chart-tooltip')
      .data([0])
      .join('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('background', 'var(--bg-secondary)')
      .style('border', '1px solid var(--border-color)')
      .style('border-radius', '8px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    // Add data points
    const circles = g.selectAll('.data-point')
      .data(chartPoints)
      .join('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => sizeScale(d.size))
      .attr('fill', d => d.color)
      .attr('stroke', d => selectedIdea?.id === d.id ? 'var(--color-ocean-blue)' : 'white')
      .attr('stroke-width', d => selectedIdea?.id === d.id ? 3 : 1)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1);
        
        tooltip
          .style('opacity', 1)
          .html(`
            <div><strong>${d.idea.title}</strong></div>
            <div>Impact: ${d.idea.impact} | Effort: ${d.idea.effort}m</div>
            <div>Confidence: ${Math.round((d.idea.confidence || 0) * 100)}%</div>
            ${model === 'RICE' ? `<div>Reach: ${d.idea.reach || 'N/A'}</div>` : ''}
            <div>Score: ${d.idea.score?.toFixed(2) || 'N/A'}</div>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8);
        tooltip.style('opacity', 0);
      })
      .on('click', function(event, d) {
        event.stopPropagation();
        onSelectIdea(d.idea);
      });

    // Add drag behavior
    const drag = d3.drag<SVGCircleElement, ChartPoint>()
      .on('start', function() {
        setIsDragging(true);
        d3.select(this).attr('opacity', 1);
      })
      .on('drag', function(event, d) {
        const newX = Math.max(0, xScale.invert(event.x));
        const newY = Math.max(0, yScale.invert(event.y));
        
        d3.select(this)
          .attr('cx', event.x)
          .attr('cy', event.y);
          
        // Update tooltip position during drag
        tooltip
          .style('left', (event.sourceEvent.pageX + 10) + 'px')
          .style('top', (event.sourceEvent.pageY - 10) + 'px')
          .html(`
            <div><strong>${d.idea.title}</strong></div>
            <div>Impact: ${newY.toFixed(1)} | Effort: ${newX.toFixed(1)}m</div>
            <div>Drag to adjust values</div>
          `);
      })
      .on('end', function(event, d) {
        setIsDragging(false);
        
        const newEffort = Math.max(0.1, xScale.invert(event.x));
        const newImpact = Math.max(0.25, Math.min(3, xScale.invert(event.y)));
        
        // Snap impact to valid levels
        const validImpacts = [0.25, 0.5, 1, 2, 3];
        const snappedImpact = validImpacts.reduce((prev, curr) => 
          Math.abs(curr - newImpact) < Math.abs(prev - newImpact) ? curr : prev
        );
        
        onUpdateIdea(d.id, {
          effort: Math.round(newEffort * 10) / 10,
          impact: snappedImpact as any,
          provenance: {
            ...d.idea.provenance,
            effort: 'user',
            impact: 'user'
          }
        });
        
        tooltip.style('opacity', 0);
      });

    circles.call(drag);

    // Cleanup tooltip on unmount
    return () => {
      d3.select('body').selectAll('.chart-tooltip').remove();
    };
  }, [chartPoints, dimensions, medians, selectedIdea, model, onUpdateIdea, onSelectIdea]);

  if (validIdeas.length < 2) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8', className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Quadrant Chart
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add at least 2 complete ideas to see the impact vs effort visualization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Impact vs Effort ({validIdeas.length} ideas)
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isDragging ? 'Drag to adjust values' : 'Click points to select, drag to adjust'}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <svg
          ref={svgRef}
          className="w-full h-96"
          style={{ minHeight: '400px' }}
        />
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary-red"></div>
            <span>High Score</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary-terracotta"></div>
            <span>Medium Score</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary-soft-blue"></div>
            <span>Low Score</span>
          </div>
          <div className="text-xs">
            Point size = {model === 'RICE' ? 'Reach' : 'Confidence'}
          </div>
        </div>
      </div>
    </div>
  );
}
