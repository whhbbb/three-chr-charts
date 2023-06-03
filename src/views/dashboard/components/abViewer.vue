<template>
  <el-card class="abViewer-container">
    <div class="title">A/B区室 Compartment</div>
    <img style="height: 30px;object-fit: contain;" src="@/assets/images/color01.gif" alt="" class="color-tips">
    <div ref="chart0" class="chart" style="margin-top:0" />
    <div ref="chart5" class="chart" />
    <div ref="chart10" class="chart" />
    <div ref="chart20" class="chart" />
  </el-card>
</template>

<script>
import * as echarts from 'echarts'

export default {
  mounted() {
    this.renderNormalChart('chart0', '0 DPA', [
      [5, 7.5, 0.01],
      [7.5, 10, -0.02]
    ])
    this.renderNormalChart('chart5', '5 DPA', [
      [5, 7.5, 0.01],
      [7.5, 10, -0.02]
    ])
    this.renderNormalChart('chart10', '10 DPA', [
      [5, 7.5, 0.01],
      [7.5, 10, -0.02]
    ])
    this.renderNormalChart('chart20', '20 DPA', [
      [5, 7.5, 0.01],
      [7.5, 10, -0.02]
    ], true)
  },
  methods: {
    renderNormalChart(refName, dpaNum, data, isLast = false) {
      data = data.map(function(item, index) {
        let color = ''
        if (item[2] < 0) {
          color = '#69A5C0'
        } else {
          color = '#AF362C'
        }
        return {
          value: item,
          itemStyle: {
            color
          }
        }
      })

      const option = {
        xAxis: {
          show: isLast,
          type: 'value',
          min: 5,
          max: 25,
          interval: 2.5,
          axisLine: {
            onZero: false,
            lineStyle: {
              color: '#000'
            }
          },
          axisTick: {
            alignWithLabel: true
          },
          splitLine: {
            show: false
          },

          axisLabel: {
            formatter: function(value, index) {
              if (value === 25) {
                return value + '(Mb)' // 在最后一个刻度上添加单位标识
              }
              return value
            }
          }

        },
        yAxis: {
          type: 'value',
          min: -0.04,
          max: 0.02,
          interval: 0.02,
          axisLine: {
            lineStyle: {
              color: '#000'
            }
          },
          splitLine: {
            show: false
          }
        },
        graphic: [
          {
            type: 'text',
            left: '90%',
            top: '30px',
            rotation: Math.PI / 2,
            style: {
              text: dpaNum,
              textAlign: 'center',
              textVerticalAlign: 'bottom',
              fill: '#000',
              fontSize: 14,
              backgroundColor: '#ccc',
              padding: 6,
              borderRadius: 4,
              lineHeight: 8
            }
          }
        ],
        series: [
          {
            type: 'custom',
            renderItem: function(params, api) {
              var yValue = api.value(2)
              var start
              var size
              var style = api.style()

              if (yValue < 0) {
                // 当 y 轴的值小于 0
                start = api.coord([api.value(0), 0]) // 设置起点为 0
                size = api.size([api.value(1) - api.value(0), yValue]) // 使用 yValue 作为高度
              } else {
                start = api.coord([api.value(0), yValue])
                size = api.size([api.value(1) - api.value(0), yValue])
              }

              return {
                type: 'rect',
                shape: {
                  x: start[0],
                  y: start[1],
                  width: size[0],
                  height: size[1]
                },
                style: style
              }
            },
            dimensions: ['from', 'to', 'profit'],
            encode: {
              x: [0, 1],
              y: 2,
              tooltip: [0, 1, 2],
              itemName: 3
            },
            data: data
          }

        ]
      }

      // 使用 ECharts 库渲染图表
      const chart = echarts.init(this.$refs[refName])
      chart.setOption(option)
    }
  }
}
</script>

<style scoped lang="scss">
.abViewer-container {
  /* background-color: pink; */
  width: 28vw;
  min-width: 400px;
  display: flex;
  flex-direction: column;
}
.title {
  font-size: 30px;
  width: 100%;
  text-align: center;
  color: #1A5D7E
}
.color-tips {
  margin-top: 15px;
  width: 100%;
  height: 30px;
  object-fit: cover;
}

.chart {
  width: 100%;
  height: 180px;
  margin-top: -110px;
}
</style>
