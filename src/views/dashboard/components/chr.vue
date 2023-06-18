<template>
  <el-card class="all-container">
    <div class="chr-container">
      <div class="title">chr11:98.2-100.2Mb</div>
      <div class="conatiner">
        <div class="left-color-tips">
          <div class="people-img">
            <img src="@/assets/images/person.gif" alt="">
          </div>
          <div class="color-bar" />
        </div>
        <div class="chart-position-container">
          <div class="chart-container">
            <div id="chart" class="chart" />
            <div class="mask-container" />
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
export default {
  filter: {
    type: Object,
    default: () => {}
  },
  mounted() {
    this.renderChart()
  },
  methods: {
    renderChart() {
      const data = [
        [0, 1, 5, 6],
        [16, 17, 18, 19],
        [4, 5, 12, 13],
        [8, 9, 22, 23],
        [0, 1, 7, 8]
      ].map(function(item, index) {
        return {
          value: item,
          itemStyle: {
            color: '#0025C2'
          }
        }
      })

      const option = {
        width: '80%',
        height: '80%',
        // tooltip: {
        //   axisPointer: {
        //     type: 'shadow',
        //     rotate: 10 // 设置旋转角度为 135 度
        //   }
        // },
        xAxis: {
          type: 'value',
          min: 0,
          max: 40,
          interval: 1
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 40,
          interval: 1
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
          },
          {
            type: 'line',
            data: [[0, 40], [40, 0]], // 左上角到右下角的起始和结束点
            showSymbol: false,
            lineStyle: {
              color: '#000',
              cap: 'round'
            },
            animation: false // 禁用直线的动画效果
          }
        ]
      }

      echarts.init(document.querySelector('#chart')).setOption(option)
    }

  }
}
</script>

<style lang="scss" scoped>
.all-container {
  width: 30vw;
  height: 22vw;
  min-width: 650px;
  min-height: 400px;
}
.chr-container {
  position: relative;
  width: 100%;
  height: 100%;

  .conatiner {
    position: absolute;
    top: 110px;
    width: 100%;
    height: 90%;
  }

  .title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 20px;
    font-weight: 600;
    height: 30px;
  }
}

.left-color-tips {
  position: absolute;
  left: 60px;
  top: -60px;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  transform: translateX(-50%);
  width: 80px;
  // background-color: pink;
  height: 250px;
  .people-img {
    height: 35%;
    overflow: hidden;
    img {
      height: 100%;
      object-fit: cover;
    }
  }
  .color-bar {
    width: 30%;
    height: 80%;
    border: 2px solid #000;
    background: linear-gradient(to bottom,#FE0404, #fff);
    border-radius: 3px;
  }
}

.chart-position-container {
  position: absolute;
  right: 30px;
  width: 450px;
  height: 450px;

  .chart-container {
    position: absolute;
    overflow: hidden;
    width: 100%;
    height: 100%;
    transform: rotate(135deg);

    .chart {
      position: absolute;
      top:50%;
      left: 50%;
      height: 100%;
      width: 100%;
      transform: translate(-50%, -50%);
    }

    .mask-container {
      position: absolute;
      top: 0;
      right: 0;
      width: 0;
      height: 0;
      border-top: 462.5px solid #fff;
      border-left: 462.5px solid transparent;
      // transform: translate(-10%,-6.5%)
    }
  }
}

</style>
