<template>
  <el-card v-loading="loading" class="abViewer-container">
    <div class="title">A/B区室 Compartment</div>
    <img style="height: 30px;object-fit: contain;" src="@/assets/images/color01.gif" alt="" class="color-tips">
    <div id="chart" ref="chart" class="chart" style="margin-top:0" :style="{height: allChartHeight + 'px'}" />
    <div class="tools-container" style="margin-top: 25px;">
      <div class="download-container">
        <span>下载宽度：</span>
        <el-input v-model="downloadWidth" style="width: 70px;" /> px
        <el-button style="margin-left: 20px;" type="primary" @click="downloadCharts">Download <i class="el-icon-download" /></el-button>
      </div>
      <div class="gene-modes" style="margin-top: 15px">
        <el-switch
          v-model="geneSelect"
          active-text="Canomical transcript"
          inactive-text="All transcript"
        />
      </div>
    </div>
  </el-card>
</template>

<script>
import { compartmentResult } from '@/api/compartment'
import * as echarts from 'echarts'

export default {
  props: {
    filter: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      firstChartHeight: 160,
      downloadWidth: '',
      geneSelect: true,
      allChartHeight: 600, // 400 + geneHeight
      compartment: [],
      loading: true,
      // 最大的y
      maxYRange: 1.6, // 动态调整为最大的+0.6
      geneHeight: 200, // 动态调整为 100 * 个数
      singleGenes: [[0, 1, 10], [1, 1, 10], [1, 20, 40]], // 直线们
      singleArrows: [[6, 0.3, 1], [25, 0.3, -1], [4, 1.3, 1]], // 箭头们
      exons: [
        [0, 1, 30, 440],
        [1, 1, 10, 40]
      ],
      xAxiosRange: {}
    }
  },
  mounted() {
    this.makeCharts()
  },
  methods: {
    // 画上边的图
    makeTopItem(item) {
      return echarts.util.merge({
        data: [item[0], item[1], item[2]],
        tooltip: {
          formatter: function(params) {
            const start = item[0]
            const end = item[1]
            const value = item[2]
            const color = 'pink'

            // 自定义tooltip内容，添加彩色圆点和文字
            return '<div>' +
             '<span style="display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:50%;background-color:' + color + ';"></span>' +
             '<span">Start:</span> ' + start + 'Mb<br>' +
             '<span style="display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:50%;background-color:' + color + ';"></span>' +
             '<span">End:</span> ' + end + 'Mb<br>' +
             '<span style="display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:50%;background-color:' + color + ';"></span>' +
             '<span>Value:</span> ' + value +
             '</div>'
          }
        },
        type: 'custom',
        xAxisIndex: 0,
        yAxisIndex: 0,
        renderItem: function(params, api) {
          const visibleWidth = params.coordSys.width // 可视区的结束像素
          const startXPos = params.coordSys.x // 可视区的开始像素

          const rowStart = api.coord([item[0], item[2]]) // 原始开始点应该的位置
          const rowEnd = api.coord([item[1], item[2]]) // 原始结束点应该的位置
          const zeroPos = api.coord([0, 0])

          const height = api.size([1, item[2]])[1]

          // 如果x左边超过了
          let xLeftOutOfRange = false
          let xPosition = api.coord([item[0], 0])[0]
          if (xPosition <= startXPos) {
            xPosition = startXPos
            xLeftOutOfRange = true
          }

          let width = api.size([item[1] - item[0], 0])[0]
          if (xLeftOutOfRange) {
            width = width - (startXPos - rowStart[0])
          }

          if (rowEnd[0] > visibleWidth + startXPos) {
            width = api.size([item[1] - item[0], 0])[0] - (rowEnd[0] - visibleWidth - startXPos)
          }

          if (width > visibleWidth) width = visibleWidth
          width = width >= 0 ? width : 0

          var style = api.style()

          var color
          if (item[2] < 0) {
            color = '#65A5C9' // 红色
          } else {
            color = '#AC372E' // 蓝色
          }
          style.fill = color
          return {
            type: 'rect',
            shape: {
              x: xPosition,
              y: Math.min(rowStart[1], zeroPos[1]),
              width: width,
              height: height
            },
            style: style
          }
        },
        legend: {},
        dimensions: ['start', 'end', 'value'],
        encode: {
          x: [0, 1],
          y: 2,
          tooltip: [0, 1, 2],
          itemName: 0
        }
      })
    },
    // 返回上边的图们
    makeTopItems() {
      const items = []
      this.compartment.map(i => {
        items.push(this.makeTopItem(i))
      })
      return items
    },
    // 画直线
    makeIntron(data) {
      return echarts.util.merge({
        type: 'line',
        xAxisIndex: 1,
        yAxisIndex: 1,
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
        xAxisIndex: 1,
        yAxisIndex: 1,
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
        xAxisIndex: 1,
        yAxisIndex: 1,
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
        dimensions: ['name', 'start', 'end', 'value'],
        encode: {
          x: [1, 2],
          y: 0,
          tooltip: [1, 2, 3], // 只使用索引2的值作为tooltip内容
          itemName: 0
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
    // 直角坐标系内绘图网格
    makeGrid(top, height, opt) {
      return echarts.util.merge({
        left: 90,
        right: 90,
        top: top,
        height: height
      }, opt || {}, true)
    },
    // 处理数据
    async handleData() {
      console.log('开始处理数据')
      this.compartment = []
      this.loading = true
      const range = {
        start: this.filter.chrStart,
        end: this.filter.chrEnd
      }
      console.log(this.filter)

      const { data } = await compartmentResult(this.filter.chromosome.cs_ID, range)
      if (data == null) {
        this.$message.error('查询不到数据')
        return
      }
      // 处理每一个节点

      data.map(item => {
        const val = []
        val.push(item.start_POINT)
        val.push(item.end_POINT)
        val.push(item.value)
        this.compartment.push(val)
      })

      let minVal = Infinity
      const maxVal = -Infinity
      const compartment = this.compartment
      for (let i = 0; i < compartment.length; ++i) {
        if (compartment[i][0] < minVal) {
          minVal = compartment[i][0]
        }
        if (compartment[i][1] < minVal) {
          minVal = compartment[i][1]
        }
        if (compartment[i][0] > maxVal) {
          minVal = compartment[i][0]
        }
        if (compartment[i][1] > minVal) {
          minVal = compartment[i][1]
        }
      }

      this.xAxiosRange.minX = minVal
      this.xAxiosRange.maxX = maxVal
    },
    // 渲染图
    renderChart(refName) {
      /* eslint-disable */
      const vm = this
      const option = {
        animation: false,
        // 工具栏
        tooltip: {},
        // 直角坐标系内绘图网格
        grid: [
          this.makeGrid(40, this.firstChartHeight),
          this.makeGrid(40 + (this.firstChartHeight + 60), this.geneHeight)
        ],
        xAxis: [
          {
            gridIndex: 0,
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
          },
          {
            gridIndex: 1,
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
          }
        ],
        yAxis: [
          {
            gridIndex: 0,
            max: 0.03,
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#000'
              }
            },
            splitLine: {
            }
          },
          {
            gridIndex: 1,
            type: 'value',
            max: this.maxYRange,
            axisLine: {
              lineStyle: {
                color: '#000'
              }
            },
            splitLine: {}
          }
        ],
        series: [
          // 上面的图
          ...this.makeTopItems(),
          // 下面的图
          // 绘制直线们
          ...this.makeIntrons(),
          // 绘制蓝方块们
          ...this.makeExons(),
          // 绘制箭头们
          ...this.makeArrows()
        ],
        graph: [
          ...this.makeIntrons()
        ],
      }

      // 使用 ECharts 库渲染图表
      const chart = echarts.init(this.$refs[refName], 'lignt', {
        renderer: 'svg' // 指定渲染器为SVG
      })
      this.loading = false
      chart.setOption(option)

      this.downloadWidth = chart.getWidth()
    },
    // 主动调用下载
    async downloadCharts() {
      console.log()
      if (isNaN(this.downloadWidth)) {
        this.$message.error('请输入正确的宽度')
        return
      }
      const chart = echarts.getInstanceByDom(document.querySelector('#chart'))
      const orginWidth = chart.getWidth()
      const originHeight = chart.getHeight()
      const originGeneHeight = this.geneHeight
      const originFirstChartHeight = this.firstChartHeight

      this.loading = true
      this.geneHeight = this.geneHeight * this.downloadWidth / orginWidth
      this.firstChartHeight = this.firstChartHeight * this.downloadWidth / orginWidth
      await chart.resize({
        width: this.downloadWidth,
        height: this.downloadWidth / orginWidth * originHeight + 60
      })
      await this.renderChart('chart')
      const img = new Image()
      img.src = chart.getDataURL({
        pixelRatio: 1,
        excludeComponents: ['dataZoom']
      })

      const downloadLink = document.createElement('a')
      downloadLink.href = img.src
      downloadLink.download = 'chart.svg' // 设置下载的文件名

      downloadLink.click()
      this.geneHeight = originGeneHeight
      this.firstChartHeight = originFirstChartHeight

      await chart.resize({
        width: orginWidth,
        height: originHeight
      })
      await this.renderChart('chart')

      this.loading = false
    },
    // 绘图
    async makeCharts() {
      await this.handleData()
      this.renderChart('chart')
    }
  }
}
</script>

<style scoped lang="scss">
.abViewer-container {
  /* background-color: pink; */
  width: 90%;
  margin-bottom: 40px;
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
  margin-top: -110px;
}
</style>
