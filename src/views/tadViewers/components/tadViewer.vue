<template>
  <el-card v-loading="loading" class="chr-container">
    <div class="title">chr</div>
    <div class="charts-tools-container">
      <div class="color-controlers-container">
        <div class="color-tips">最高值颜色</div>
        <el-color-picker v-model="maxColor" @change="changeMaxColor" />
        <div class="color-tips">最低值颜色</div>
        <el-color-picker v-model="minColor" @change="changeMinColor" />
      </div>
      <div class="downlaod-container" style="display: flex;">
        <el-button style="margin-right: 20px;" type="danger" @click="downloadCharts">Download <i class="el-icon-download" /></el-button>
        <div class="svg-size">
          <span>下载宽度：</span>
          <el-input v-model="downloadWidth" style="width: 70px;" /> px
        </div>
      </div>
    </div>
    <div class="charts-conatiner">
      <div class="charts-over-hidder-container">
        <div class="chart-position-container">
          <div class="chart-container">
            <div id="chart" class="chart" />
            <!-- <div class="mask-container" /> -->
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import { hicResult } from '@/api/tad'
export default {
  filter: {
    type: Object,
    default: () => {}
  },
  data() {
    return {
      resolution: 5000,
      hicData: [],
      axiosRange: {},
      loading: true,
      maxColor: '#D33A23',
      minColor: '#ffffff',
      downloadWidth: 700
    }
  },
  async mounted() {
    this.makeCharts()
  },
  methods: {
    /**
     * 代码写的很屎，耦合度很高，赶时间的凑活事，如果有人要重构的时候注意异步，这里的异步情况很怪
     */

    // 改变最大值的颜色
    changeMaxColor(val) {
      this.maxColor = val
      if (val === null) return
      this.handleData()
    },
    // 改变最小值的颜色
    changeMinColor(val) {
      this.minColor = val
      if (val === null) return
      this.handleData()
    },
    interpolateColorFn(value, minValue, maxValue, startColor, endColor) {
      // 将值限制在最小值和最大值之间
      const clampedValue = Math.max(Math.min(value, maxValue), minValue)

      // 计算值在最小值和最大值之间的比例
      const ratio = (clampedValue - minValue) / (maxValue - minValue)

      // 提取起始颜色的RGB值
      const startRed = parseInt(startColor.substr(1, 2), 16)
      const startGreen = parseInt(startColor.substr(3, 2), 16)
      const startBlue = parseInt(startColor.substr(5, 2), 16)

      // 提取结束颜色的RGB值
      const endRed = parseInt(endColor.substr(1, 2), 16)
      const endGreen = parseInt(endColor.substr(3, 2), 16)
      const endBlue = parseInt(endColor.substr(5, 2), 16)

      // 计算插值后的RGB值
      const interpolatedRed = Math.round(startRed + (endRed - startRed) * ratio)
      const interpolatedGreen = Math.round(startGreen + (endGreen - startGreen) * ratio)
      const interpolatedBlue = Math.round(startBlue + (endBlue - startBlue) * ratio)

      // 将插值后的RGB值转换为十六进制表示的颜色值
      const interpolatedColor = `#${interpolatedRed.toString(16).padStart(2, '0')}${interpolatedGreen.toString(16).padStart(2, '0')}${interpolatedBlue.toString(16).padStart(2, '0')}`

      return interpolatedColor
    },
    // 画图
    async renderChart(chartName) {
      const vm = this
      const option = {
        grid: {
          left: 0,
          top: 0,
          containLabel: true,
          width: 600,
          height: 600
        },
        xAxis: {
          type: 'value',
          max: vm.axiosRange.maxX,
          show: false,
          interval: this.resolution
        },
        yAxis: {
          type: 'value',
          show: false,
          max: vm.axiosRange.maxY,
          interval: this.resolution
        },
        series: [
          {
            type: 'custom',
            renderItem: function(params, api) {
              var xStart = api.value(0)
              var xEnd = api.value(1)
              var yStart = api.value(3)
              var yEnd = api.value(2)
              var start = api.coord([xStart, yStart])
              var size = api.size([xEnd - xStart, Math.abs(yEnd - yStart)])
              var style = api.style()

              // 处理颜色
              const interpolatedColor = vm.interpolateColorFn(api.value(4), vm.minVals, vm.maxVals, vm.minColor, vm.maxColor)
              style.fill = interpolatedColor

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
            data: this.hicData
          },
          {
            type: 'line',
            data: [[this.axiosRange.minX, this.axiosRange.minY], [this.axiosRange.maxX, this.axiosRange.maxY]], // 左下角到右上角的起始和结束点
            showSymbol: false,
            lineStyle: {
              color: '#000',
              cap: 'round'
            },
            animation: false // 禁用直线的动画效果
          },
          {
            type: 'line',
            data: [[this.axiosRange.minX, this.axiosRange.minY], [this.axiosRange.minX, this.axiosRange.maxY]], // 边框线
            showSymbol: false,
            lineStyle: {
              color: '#000',
              cap: 'round'
            },
            animation: false // 禁用直线的动画效果
          },
          {
            type: 'line',
            data: [[this.axiosRange.minX, this.axiosRange.maxY], [this.axiosRange.maxX, this.axiosRange.maxY]], // 边框线
            showSymbol: false,
            lineStyle: {
              color: '#000',
              cap: 'round'
            },
            animation: false // 禁用直线的动画效果
          }
        ]
      }
      await echarts.init(document.querySelector(chartName), 'lignt', {
        renderer: 'svg' // 指定渲染器为SVG
      }).setOption(option)
      this.loading = false
    },
    // 处理数据
    async handleData() {
      this.loading = true

      const filter = this.$attrs.filter

      const range = {
        binXStart: filter.chrStart,
        binXEnd: filter.chrEnd,
        binYStart: filter.chrStart,
        binYEnd: filter.chrEnd
      }
      /* eslint-disable */
      const vm = this // 赶时间 就这么写吧
      const res = []
      async function pollData(uid) {
        range.uuid = uid
        const { data, code } = await hicResult(filter.chromosome.cs_ID, range)

        if (data === null) {
          console.log('轮询结束')
          console.log(res)

          res.forEach(item => {
            vm.hicData.push([item.genomeX, item.genomeX + vm.resolution, item.genomeY, item.genomeY + vm.resolution, item.counts])
          })

          // 找大值小值 直接用扩展符号就堆栈溢出了
          const xStart = vm.hicData.map(item => item[0])
          const xEnd = vm.hicData.map(item => item[1])
          const yStart = vm.hicData.map(item => item[2])
          const yEnd = vm.hicData.map(item => item[3])
          const chartVals = vm.hicData.map(item => item[4])
          const xAxios = [...xStart, ...xEnd]
          const yAxios = [...yStart, ...yEnd]
          let maxX = xAxios[0]
          let minX = xAxios[0]
          let maxY = yAxios[0]
          let minY = yAxios[0]

          for (let i = 1; i < xAxios.length; i++) {
            if (xAxios[i] > maxX) {
              maxX = xAxios[i]
            }
            if (xAxios[i] < minX) {
              minX = xAxios[i]
            }
            if (yAxios[i] > maxY) {
              maxY = yAxios[i]
            }
            if (yAxios[i] < minY) {
              minY = yAxios[i]
            }
          }

          vm.axiosRange.maxX = maxX
          vm.axiosRange.minX = minX
          vm.axiosRange.maxY = maxY
          vm.axiosRange.minY = minY
          let minVal = chartVals[0]
          let maxVal = chartVals[0]

          for (let i = 1; i < chartVals.length; i++) {
            if (chartVals[i] < minVal) {
              minVal = chartVals[i]
            }
            if (chartVals[i] > maxVal) {
              maxVal = chartVals[i]
            }
          }

          vm.minVals = minVal
          vm.maxVals = maxVal

          // vm.hicData = vm.hicData.filter(item => item[0] + item[3] <= Math.max(vm.axiosRange.maxX, vm.axiosRange.maxY))

          console.log('res:', res)
          await vm.renderChart('#chart')
          return
        } else if (code === 202 && data !== null) {
          res.push(...data.matrixPoints)
          console.log('轮询结束')
          console.log(res)

          res.forEach(item => {
            vm.hicData.push([item.genomeX, item.genomeX + vm.resolution, item.genomeY, item.genomeY + vm.resolution, item.counts])
          })

          // 找大值小值 直接用扩展符号就堆栈溢出了
          const xStart = vm.hicData.map(item => item[0])
          const xEnd = vm.hicData.map(item => item[1])
          const yStart = vm.hicData.map(item => item[2])
          const yEnd = vm.hicData.map(item => item[3])
          const chartVals = vm.hicData.map(item => item[4])
          const xAxios = [...xStart, ...xEnd]
          const yAxios = [...yStart, ...yEnd]
          let maxX = xAxios[0]
          let minX = xAxios[0]
          let maxY = yAxios[0]
          let minY = yAxios[0]

          for (let i = 1; i < xAxios.length; i++) {
            if (xAxios[i] > maxX) {
              maxX = xAxios[i]
            }
            if (xAxios[i] < minX) {
              minX = xAxios[i]
            }
            if (yAxios[i] > maxY) {
              maxY = yAxios[i]
            }
            if (yAxios[i] < minY) {
              minY = yAxios[i]
            }
          }

          vm.axiosRange.maxX = maxX
          vm.axiosRange.minX = minX
          vm.axiosRange.maxY = maxY
          vm.axiosRange.minY = minY
          let minVal = chartVals[0]
          let maxVal = chartVals[0]

          for (let i = 1; i < chartVals.length; i++) {
            if (chartVals[i] < minVal) {
              minVal = chartVals[i]
            }
            if (chartVals[i] > maxVal) {
              maxVal = chartVals[i]
            }
          }

          vm.minVals = minVal
          vm.maxVals = maxVal

          // vm.hicData = vm.hicData.filter(item => item[0] + item[3] <= Math.max(vm.axiosRange.maxX, vm.axiosRange.maxY))
          console.log('res:', res)
          await vm.renderChart('#chart')
          return
        }
        const nextUid = data.uuid === null ? '' : data.uuid

        res.push(...data.matrixPoints)
        if (code === 200) {
          setTimeout(() => pollData(nextUid), 5000)
        }
      }
      await pollData('')
    },
    // 主动调用下载
    async downloadCharts() {
      console.log()
      if (isNaN(this.downloadWidth)) {
        this.$message.error('请输入正确的宽度')
        return
      }
      const chart = echarts.getInstanceByDom(document.querySelector('#chart'))

      this.loading = true
      await chart.resize({
        width: this.downloadWidth,
        height: this.downloadWidth
      })
      await this.renderChart('#chart')
      const img = new Image()
      img.src = chart.getDataURL({
        pixelRatio: 1
      })

      const downloadLink = document.createElement('a')
      downloadLink.href = img.src
      downloadLink.download = 'chart.svg' // 设置下载的文件名

      downloadLink.click()
      chart.resize({
        width: 750,
        height: 750
      })
      this.loading = false
    },
    makeCharts() {
      this.handleData()
    }
  }
}
</script>

<style lang="scss" scoped>
.chr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  border-radius: 5px;
  width: 100%;
  height: 820px;
  min-width: 1100px;
  margin-bottom: 50px;
  overflow: hidden;
  margin-bottom: 50px;

  .title {
    width: 100%;
    font-size: 35px;
    font-weight: 700;
    text-align: center;
  }

  .charts-conatiner {
    margin-top: 200px;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    width: 90%;
    height: 90%;
  }

}

.charts-tools-container {
  display: flex;
  margin-top: 50px;
  flex-direction: column;
  align-items: flex-end;
  .color-controlers-container {
  display: flex;
  justify-items: center;
  margin-bottom: 20px;
  .color-tips {
    line-height: 40px;
    margin-right: 10px;
  }
  }
}

.chart-position-container {
  position: relative;
  right: 30px;
  width: 700px;
  height: 700px;

  .chart-container {
    position: relative;
    width: 700px;
    height: 100%;
    transform: rotate(47deg);
    .chart {
      position: absolute;
      top:50%;
      left: 50%;
      height: 750px;
      width: 750px;
      transform: translate(-50%, -50%);
    }

    .mask-container {
      position: absolute;
      top: 0;
      right: 0;
      width: 0;
      overflow: hidden;
      border-top: 778px solid #fff;
      border-left: 752px solid transparent;
    }
  }
}

</style>
