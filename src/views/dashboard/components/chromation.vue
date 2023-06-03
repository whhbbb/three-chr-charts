<template>
  <div class="chromation-container">
    <div class="title">染色质环 Loop</div>
    <div class="charts-container">
      <div class="chart-instance" style="margin-top: 0;">
        <div ref="chart1" class="chart" style="margin-top:0;" />
        <div class="chart-title">
          <div>CHIA-PET</div>
          <div>loops-rep1</div>
        </div>
      </div>
      <div class="chart-instance">
        <div class="chart-title">
          <div>CHIA-PET</div>
          <div>peeks-rep1</div>
        </div>
        <div ref="chart2" class="chart" />
      </div>
      <div class="chart-instance">
        <div ref="chart3" class="chart" />
        <div class="chart-title">
          <div>CHIA-PET</div>
          <div>loops-rep2</div>
        </div>
      </div>
      <div class="chart-instance">
        <div ref="chart4" class="chart" />
        <div class="chart-title">
          <div>CHIA-PET</div>
          <div>peeks-rep2</div>
        </div>
      </div>
    </div>
    <!-- <div class="genes-container">
      <div ref="genes" class="genes" />
      <span class="gene-title">Genes</span>
    </div> -->
    <div class="switched-peaks-container">
      <div ref="peaks" class="peaks" />
      <span class="peaks-title">Stitched Peaks</span>
    </div>
    <div class="color-tips">
      <img src="@/assets/images/color02.gif" alt="">
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  mounted() {
    this.renderNormalChart('chart1', [[5, 10, 5], [10, 20, 5]])
    this.renderNormalChart('chart2', [[0, 10, 1], [10, 20, 2]])
    this.renderNormalChart('chart3', [[0, 10, 1], [10, 20, 2]])
    this.renderNormalChart('chart4', [[0, 10, 1], [10, 20, 2]])
    // this.renderGenes()
    this.renderPeaks()
  },
  methods: {
    renderPeaks() {
      const colorList = [
        '#4f81bd',
        '#c0504d',
        '#9bbb59',
        '#604a7b',
        '#948a54',
        '#e46c0b'
      ]

      const data = [
        [10, 20, 5, 'dhiswkwhj']
      ].map(function(item, index) {
        return {
          value: item,
          itemStyle: {
            color: colorList[index]
          },
          name: item[3]
        }
      })

      const option = {
        xAxis: {
          scale: true,
          type: 'value',
          min: 0,
          max: 50,
          show: false,
          axisLabel: {
            show: false // 不显示刻度标签
          },
          axisTick: {
            // alignWithLabel: true
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 12,
          show: false,
          axisLabel: {
            show: false // 不显示刻度标签
          },
          axisTick: {
            // alignWithLabel: true
            show: false
          },
          splitLine: {
            show: false
          }
        },
        series: [
          {
            type: 'custom',
            renderItem: function(params, api) {
              var yValue = api.value(2)
              var start = api.coord([api.value(0), yValue])
              var size = api.size([api.value(1) - api.value(0), yValue])
              var style = api.style()
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
            label: {
              show: true,
              color: '#000',
              position: 'top',
              formatter: function(params) {
                return params.data.name
              }
            },
            // dimensions: ['from', 'to', 'profit'],
            // encode: {
            //   x: [0, 1],
            //   y: 2,
            //   tooltip: [0, 1, 2],
            //   itemName: 3
            // },
            data: data
          }
        ]
      }

      echarts.init(this.$refs.peaks).setOption(option)
    },
    renderGenes() {
      const data = [
        [10, 20, 5, 6],
        [16, 18, 15, 16],
        [18, 26, 12, 14],
        [26, 32, 22, 23],
        [32, 50, 7, 8]
      ].map(function(item, index) {
        return {
          value: item,
          itemStyle: {
            color: '#0025C2'
          }
        }
      })

      const option = {
        xAxis: {
          type: 'value',
          min: 0,
          max: 50
          // scale: true,
          // show: false,
          // axisLabel: {
          //   show: false // 不显示刻度标签
          // },
          // axisTick: {
          //   // alignWithLabel: true
          //   show: false
          // },
          // splitLine: {
          //   show: false
          // }
        },
        yAxis: {
          // show: false,
          // axisLabel: {
          //   show: false // 不显示刻度标签
          // },
          // axisTick: {
          //   // alignWithLabel: true
          //   show: false
          // },
          // splitLine: {
          //   show: false
          // }
        },
        series: [
          {
            type: 'custom',
            renderItem: function(params, api) {
              var xStart = api.value(0)
              var xEnd = api.value(1)
              var yStart = api.value(2)
              var yEnd = api.value(3)
              var start = api.coord([xStart, yStart])
              var size = api.size([xEnd - xStart, yEnd - yStart])
              var style = api.style()
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
            data: data
          }
        ]
      }

      echarts.init(this.$refs.genes).setOption(option)
    },
    renderNormalChart(refName, data) {
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
          type: 'value',
          min: 0,
          max: 50,
          axisLine: {
            lineStyle: {
              color: '#000'
            }
          }
          // axisLabel: {
          //   show: false // 不显示刻度标签
          // },
          // axisTick: {
          //   // alignWithLabel: true
          //   show: false
          // },
          // splitLine: {
          //   show: false
          // }
        },
        yAxis: {
          // show: false,
          type: 'value',
          min: 0,
          max: 5,
          interval: 1,
          axisLine: {
            lineStyle: {
              color: '#000'
            }
          },
          splitLine: {
            show: false
          }
        },
        graphic: [],
        series: [
          {
            type: 'custom',
            renderItem: function(params, api) {
              var yValue = api.value(2)
              var start = api.coord([api.value(0), yValue])
              var size = api.size([api.value(1) - api.value(0), yValue])
              var style = api.style()
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
.chromation-container {
  // position: relative;
  width: 30vw;
  min-height: 500px;
  min-width: 580px;
  border: 1px solid #999;
  background-color: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.title {
  font-size: 30px;
  width: 100%;
  text-align: center;
  color: #1a5d7e;
  padding: 15px 0;
}

.charts-container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 90%;
  right: 0;
  padding-left: 40px;

  .chart-instance {
    position: relative;
    height: 100%;
    min-height: 700px;
    // margin-top: -40px;
    min-height: 65px;

    .chart {
      float: right;
      width: 85%;
      height: 100%;
      min-height: 65px;
      margin-bottom: 15px;
    }

    .chart-title {
      width: 20%;
      min-width: 80px;
      position: absolute;
      top: 25%;

      div {
        font-size: 30%;
      }
    }
  }
}
.genes-container {
  position: relative;
  width: 90%;
  padding-left: 40px;
  margin-top: -30px;
  // padding-left: -20px;
  .genes {
    float: right;
    width: 85%;
    height: 100px;
    float: right;
  }
  .gene-title {
    width: 20%;
    position: absolute;
    top: 40%;
    font-size: 35%;
  }
}

.switched-peaks-container {
  position: relative;
  width: 90%;
  padding-left: 40px;
  .peaks {
    border-bottom: 2px solid #999;
    padding-bottom: 20px;
    width: 85%;
    height: 50px;
    float: right;
  }
  .peaks-title {
    position: absolute;
    width: 20px;
    top: 30%;
    margin-right: 5px;
    font-size: 35%;
  }
}
.color-tips {
  height: 50px;
  background-color: #fff;
  position: relative;
  width: 90%;
  padding-left: 40px;
  img {
    margin-left: 1.5vw;
    margin-top: 10px;
    width: 90%;
    object-fit: cover;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
