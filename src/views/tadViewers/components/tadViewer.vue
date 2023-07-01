<template>
  <el-card class="chr-container" :style="{height:allChartsHeight + 'px'}">
    <div class="title">HIC</div>
    <div class="charts-tools-container">
      <div class="color-controlers-container">
        <div class="color-tips">最高值颜色</div>
        <el-color-picker v-model="maxColor" @change="changeMaxColor" />
        <div class="color-tips">最低值颜色</div>
        <el-color-picker v-model="minColor" @change="changeMinColor" />
      </div>
      <div class="downlaod-container" style="display: flex;">
        <!-- <el-button style="margin-right: 20px;" type="danger" @click="downloadCharts">Download <i class="el-icon-download" /></el-button>
        <div class="svg-size">
          <span>下载宽度：</span>
          <el-input v-model="downloadWidth" style="width: 70px;" /> px
        </div> -->
      </div>
      <div class="gene-modes" style="margin-top: 15px">
        <!-- <el-switch
          v-model="geneSelect"
          active-text="Canomical transcript"
          inactive-text="All transcript"
        /> -->
      </div>
    </div>
    <div class="charts-conatiner">
      <div class="charts-over-hidder-container">
        <div class="chart-position-container">
          <div class="chart-container">
            <div id="chart" class="chart" />
          </div>
        </div>
      </div>
      <div class="gene-container">
        <div id="gene" class="gene" :style="{height: geneHeight + 'px'}" />
      </div>
    </div>
  </el-card>
</template>

<script>
/* eslint-disable */ 
import * as echarts from 'echarts'
import { hicResult } from '@/api/tad'
import { geneResult } from '@/api/gene'
import { setTimeout } from 'timers';
export default {
  filter: {
    type: Object,
    default: () => {}
  },
  data() {
    return {
      geneSelect: true,
      resolution: 5000,
      hicData: [],
      axiosRange: {},
      loading: true,
      maxColor: '#D33A23',
      minColor: '#ffffff',
      downloadWidth: 700,
      geneHeight: 100, // 动态调整为 100 * 个数
      maxYRange: 1.6, // 动态调整为最大的+0.6
      allChartsHeight: 900, // 动态调整为800 + geneHeight
      singleGenes: [], // 直线们 层 开始 结束
      singleArrows: [], // 箭头们 x y 方向
      exons: [], // 层 开始x 结束x 信息
      axiosRange: {
        minX: Infinity,
        maxX: -Infinity
      }
    }
  },
  methods: {
    /**
     * 代码写的很屎，耦合度很高，赶时间的凑活事，如果有人要重构的时候注意异步，这里的异步情况很怪
     */

      // 直角坐标系内绘图网格
    makeGrid(top, height, opt) {
      return echarts.util.merge({
        left: 90,
        right: 90,
        top: top,
        height: height
      }, opt || {}, true)
    },
    // 画直线
    makeIntron(data) {
      return echarts.util.merge({
        type: 'line',
        silent: true, // 设置为静默，即使超出视图范围也绘制
        data: [[data[1], data[0] + 0.3], [data[2], data[0] + 0.3]],
        showSymbol: false,
        lineStyle: {
          color: '#000',
          cap: 'round'
        },
        animation: false
      })
    },
    // 返回直线们
    makeIntrons() {
      const introns = []
      this.singleGenes.map(item => {
        introns.push(this.makeIntron(item))
      })
      return introns
    },
    // 画箭头
    makeArrow(arrow) {
      return echarts.util.merge({
        type: 'custom',
        data: [arrow[0], arrow[1]],
        renderItem: function(params, api) {
          let show = true
          const startPosition = params.coordSys.x
          const endPosition = params.coordSys.x + params.coordSys.width
          const pos = api.coord([arrow[0], arrow[1]]) // 箭头的 x 坐标
          const direction = arrow[2] > 0 ? 35 : 0.5
          if (pos[0] <= startPosition || pos[0] >= endPosition) {
            show = false
          }
          // 绘制箭头
          return {
            invisible: !show,
            type: 'path',
            x: pos[0],
            y: pos[1],
            z2: 999,
            silent: true,
            rotation: direction,
            shape: {
              pathData: 'M0,0 L10,0 L5,10 Z' // 箭头的路径坐标
            },
            style: {
              fill: '#000' // 箭头的填充颜色
            }
          }
        }
      })
    },
    // 返回箭头们
    makeArrows() {
      const arrows = []
      this.singleArrows.map(item => {
        arrows.push(this.makeArrow(item))
      })
      return arrows
    },
    // 画方块
    makeExon(exon) {
      // 第一个表示y层级 第二个表示x开始 第三个表示x结束
      return echarts.util.merge({
        data: [exon[0], exon[1], exon[2]],
        type: 'custom',
        renderItem: function(params, api) {
          const visibleWidth = params.coordSys.width // 可视区的结束像素
          const startXPos = params.coordSys.x // 可视区的开始像素

          const rowStart = api.coord([exon[1], exon[0] + 0.6]) // 原始开始点应该的位置
          const rowEnd = api.coord([exon[2], exon[0] + 0.6]) // 原始结束点应该的位置

          const height = api.size([1, 0.6])[1]

          // 如果x左边超过了
          let xLeftOutOfRange = false
          let xPosition = api.coord([exon[1], exon[0] + 0.6])[0]
          if (xPosition <= startXPos) {
            xPosition = startXPos
            xLeftOutOfRange = true
          }

          let width = api.size([exon[2] - exon[1], 0.6])[0]
          if (xLeftOutOfRange) {
            width = width - (startXPos - rowStart[0])
          }

          if (rowEnd[0] > visibleWidth + startXPos) {
            width = visibleWidth + startXPos - rowStart[0]
          }

          if (width > visibleWidth) width = visibleWidth
          width = width >= 0 ? width : 0

          var style = api.style()
          style.fill = '#ccc'

          return {
            type: 'rect',
            x: xPosition,
            y: rowStart[1],
            bounding: 'raw',
            shape: {
              width: width,
              height: height
            },
            style: style
          }
        },
        dimensions: [exon[1], exon[2], exon[3]],
        encode: {
          x: [1, 2],
          y: 0,
          tooltip: [1, 2, 3] // 只使用索引2的值作为tooltip内容
        }
      })
    },
    // 返回方块们
    makeExons() {
      const exons = []
      this.exons.map(item => {
        exons.push(this.makeExon(item))
      })
      return exons
    },

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
        animation: false,
        grid: {
          left: 0,
          top: 0,
          // containLabel: true,
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
        binXStart: filter.chrStart / 1000000 ,
        binXEnd: filter.chrEnd / 1000000 ,
        binYStart: filter.chrStart / 1000000 ,
        binYEnd: filter.chrEnd / 1000000 
      }

     
      /* eslint-disable */
      const vm = this // 赶时间 就这么写吧
      const res = []
      async function pollData(uid) {
        range.uuid = uid
        // const { data, code } = await hicResult(filter.chromosome.cs_ID, range)
        const { data, code } = await hicResult(1089, range)

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
      // await chart.resize({
      //   width: this.downloadWidth,
      //   height: this.downloadWidth
      // })
      await chart.resize({
        width: 600,
        height: 600
      })
      await this.renderChart('#chart')

      setTimeout(() => {
        const svgString = chart.renderToSVGString();

        // 创建 SVG 元素
        const svgElement = new DOMParser().parseFromString(svgString, 'image/svg+xml').querySelector('svg');

        // 创建 <g> 元素用于旋转
        const rotateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        rotateGroup.setAttribute('transform', 'rotate(45 300 300)');

        // 创建剪裁路径
        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', 'clipPath');

        // 创建剪裁区域矩形
        const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        clipRect.setAttribute('x', '0');
        clipRect.setAttribute('y', '0');
        clipRect.setAttribute('width', '600');
        clipRect.setAttribute('height', '300');
        clipPath.appendChild(clipRect);

        // 将路径元素添加到旋转组中
        while (svgElement.firstChild) {
          rotateGroup.appendChild(svgElement.firstChild);
        }

        // 将旋转组添加到剪裁路径中
        clipPath.appendChild(rotateGroup);

        // 将剪裁路径添加到 SVG 元素中
        svgElement.appendChild(clipPath);

        // 更新 SVG 字符串
        const updatedSvgString = new XMLSerializer().serializeToString(svgElement);

        // 创建 SVG Blob 对象
        const blob = new Blob([updatedSvgString], { type: 'image/svg+xml' });

        // 创建下载链接
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'chart.svg'; // 设置下载的文件名

        downloadLink.click();

      this.loading = false
      },350)

     
    },
    async handleGeneData() {
      const filter = this.$attrs.filter
      console.log('xdsxd', filter)
      this.singleGenes = []
      this.singleArrows = []
      this.exons = []

      let res
      
      const range = {
        start: filter.chrStart,
        end: filter.chrEnd
      }
      const response = await geneResult(filter.chromosome.cs_ID, range)
      const { data } = response
      if (data === null) {
        this.$message('查询不到RNA数据')
        return
      }
      res = response.data
      

      const { rnaList, rnaStructureTs } = res
      for (const item of rnaList) {
        this.singleGenes.push([0, item.start_POINT, item.end_POINT])
        this.singleArrows.push([(item.start_POINT + item.end_POINT) / 2, 0.3, item.direction === 0 ? -1 : 1])
      }
      for (const item of rnaStructureTs) {
        this.exons.push([0, item.start_POINT, item.end_POINT, item.mrna_Name])
      }
      const singleGenes = this.singleGenes
      for(let i=0;i<singleGenes.length;++i) {
        if(singleGenes[i][1] < this.axiosRange.minX) this.axiosRange.minX = singleGenes[i][1]
        if(singleGenes[i][2] > this.axiosRange.maxX) this.axiosRange.maxX = this.singleGenes[i][2]
      }

      const geneLevels = 1
      this.geneHeight = 100 * geneLevels
      this.maxYRange = geneLevels === 1 ? 0.8 : geneLevels + 0.6
      this.allChartsHeight = 800 + this.geneHeight
    },
    makeGeneCharts() {
      const vm = this
      const option = {
        animation: false,
        grid : {
          containLabel: true,
          top: 0,
          left: 0,
          width: 823,
          height: '100%'
        },
        xAxis: {
            splitLine: {
              show: false
            },
            type: 'value',
            axisLabel: {
              formatter: '{value} Mb' // 替换 '单位' 为你想要的实际单位
            },
            scale: true,
            axisLine: {
              lineStyle: {
                color: '#000'
              }
            }
          } ,
        yAxis: {
            type: 'value',
            max: this.maxYRange,
            show: false,
            axisLine: {
              lineStyle: {
                color: '#000'
              }
            },
            splitLine: {}
          },
        tooltip: {
          formatter: function(params) {
            if (params.componentSubType === 'custom') {
              const infos = params.dimensionNames
              let tooltipContent = '<div style="text-align: left;">'
              tooltipContent += '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: pink; margin-right: 5px;"></span>'
              tooltipContent += 'start: ' + infos[0] + 'Mb<br>'
              tooltipContent += '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: blue; margin-right: 5px;"></span>'
              tooltipContent += 'end: ' + infos[1]
              tooltipContent += 'Mb</div>'
              tooltipContent += '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: pink; margin-right: 5px;"></span>'
              tooltipContent += 'name: ' + infos[2] + '<br>'
              return tooltipContent
            }
          }
        },
        // 数据更新动画的时长。
        animationDurationUpdate: 300,
        // 数据更新动画的缓动效果。
        animationEasingUpdate: 'quinticInOut',
        series: [
          // 绘制直线们
          ...this.makeIntrons(),
          // 绘制蓝方块们
          ...this.makeExons(),
          // 绘制箭头们
          ...this.makeArrows()
        ]
      }
      const chart = echarts.init(document.querySelector('#gene'), 'lignt', {
        renderer: 'svg' // 指定渲染器为SVG
      })
      this.loading = false
      this.downloadWidth = chart.getWidth()
      chart.setOption(option)
    },
    async makeCharts() {
      this.$attrs.filter.chromosome.cs_ID = 1089
      await echarts.dispose(document.querySelector('.chart'))
      await echarts.dispose(document.querySelector('.gene'))
      await this.handleData()
      await this.handleGeneData()
      await this.makeGeneCharts()
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
    transform: rotate(45deg);
    .chart {
      position: absolute;
      top:50%;
      left: 50%;
      height: 600px;
      width: 600px;
      transform: translate(-50%, -50%);
    }
  }
}
.gene-container {
  position: absolute;
  top: 280px;
  width: 850px;
}

</style>
