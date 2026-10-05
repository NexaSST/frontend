import { EChartsComposedChart as Chart, type ChartConfig } from './evilcharts/echarts-composed-chart.js';
import type { OperationalChartProps } from './OperationalChart.js';

// Evil Charts registry components, adapted to NexaSST's operational palette.
export default function OperationalChartSurface({ data, series, max, label }: OperationalChartProps) {
  const activeBarCount = series.filter((item) => item.type !== 'line'
    && data.some((row) => Number(row[item.key]) > 0)).length;
  const palette = ['#146c54', '#b56a32', '#426b94'];
  const config = Object.fromEntries(series.map((item, index) => [item.key, {
    label: item.label, colors: { light: [(palette[index % palette.length] ?? '#146c54')], dark: [(palette[index % palette.length] ?? '#146c54')] },
  }])) satisfies ChartConfig;
  return <div role="img" aria-label={label}>
    <Chart data={data} config={config} xDataKey="label" barGap={activeBarCount <= 1 ? '-100%' : undefined} renderer="svg" className={"operational-chart__surface h-60 min-w-0 max-[520px]:h-64"}>
      <Chart.Grid />
      <Chart.XAxis hideDots tickFormatter={(value) => /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value.slice(8, 10)}/${value.slice(5, 7)}` : value} />
      <Chart.YAxis minInterval={series.every((item) => item.type !== 'line') ? 1 : undefined} min={0} max={max} hideDots tickFormatter={(value) => `${value.toLocaleString('pt-BR')}${max === 100 ? '%' : ''}`} />
      <Chart.Tooltip />
      {series.map((item) => item.type === 'line'
        ? <Chart.Line key={item.key} dataKey={item.key} connectNulls={false} curveType="linear"><Chart.Dot /><Chart.ActiveDot variant="colored-border" /></Chart.Line>
        : <Chart.Bar key={item.key} dataKey={item.key} variant="default" enableHoverHighlight />)}
    </Chart>
  </div>;
}
