import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import * as d3 from 'd3';

@Component({
  selector: 'pb-donut-chart',
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.scss']
})
export class DonutChartComponent implements OnInit {

  private data = [];

  private svg;
  private width = 450;
  private height = 450;
  private margin = 40;
  private radius = Math.min(this.width, this.height) / 2 - 60;
  private colors;

  private budget;

  constructor(private dataService: DataService) {
  }

  async ngOnInit(): Promise<void> {

    this.getBudgetDetails();
  }

 getBudgetDetails(): any {
  this.dataService.getBudgetData().subscribe(res =>
    {
        this.budget = res;
        this.data = this.budget.myBudget;
        this.setDimensions();
        this.setColors();
        this.createD3Chart();
    });
  }


  private setDimensions(): void {
    this.svg = d3.select('figure#donut')
    .append('svg')
    .attr('width', this.width)
    .attr('height', this.height)
    .append('g')
    .attr(
      'transform',
      'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
    );

    this.svg.append('g')
    .attr('class', 'slices');
    this.svg.append('g')
    .attr('class', 'labels');
    this.svg.append('g')
    .attr('class', 'lines');

}

private setColors(): void {
  this.colors = d3.scaleOrdinal()
  .domain(this.data.map(d => d.budget.toString()))
  .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);
}

private createD3Chart(): void {
  const pie = d3.pie<any>().value((d: any) => Number(d.budget));

  const arc = d3.arc()
  .outerRadius(this.radius * 0.8)
  .innerRadius(this.radius * 0.4);

  const outerArc = d3.arc()
  .innerRadius(this.radius * 0.9)
  .outerRadius(this.radius * 0.9);

  this.svg
  .selectAll('pieces')
  .data(pie(this.data))
  .enter()
  .append('path')
  .attr('d', d3.arc()
    .innerRadius(this.radius * .4)
    .outerRadius(this.radius * .8)
  )
  .attr('fill', (d, i) => (this.colors(i)))
  .attr('stroke', '#FFFFFF')
  .style('stroke-width', '1px');

  const labelPos = d3.arc()
  .innerRadius(200)
  .outerRadius(this.radius);

  // Add the polylines between chart and labels:
  this.svg
  .selectAll('polyline')
  .data(pie(this.data))
  .enter()
  .append('polyline')
  .attr('stroke', 'black')
  .style('fill', 'none')
  .attr('stroke-width', 1)
  .attr('points', d => {
    const posA = arc.centroid(d); // line insertion in the slice
    const posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
    const posC = outerArc.centroid(d); // Label position = almost the same as posB
    // we need the angle to see if the X position will be at the extreme right or extreme left
    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    posC[0] = this.radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
    return [posA, posB, posC];
  });


  this.svg
  .selectAll('labels')
  .data(pie(this.data))
  .enter()
  .append('text')
  .text(d => d.data.title)
  .attr('transform', d => {
    var pos = outerArc.centroid(d);
    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
    pos[0] = this.radius * 0.99 * (midangle < Math.PI ? 1 : -1);
    return 'translate(' + pos + ')';
})
  .style('text-anchor', d => {
    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
    return (midangle < Math.PI ? 'start' : 'end')
});


}
midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }

}
