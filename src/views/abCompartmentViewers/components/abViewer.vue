<template>
  <el-card class="abViewer-container">
    <div class="title">A/B区室 Compartment</div>
    <img style="height: 30px;object-fit: contain;" src="@/assets/images/color01.gif" alt="" class="color-tips">
    <div class="zoom-tools" style="display: flex;justify-content: flex-end;">
      <el-button type="primary" icon="el-icon-back" @click="lastRange" />
      <el-button type="primary" icon="el-icon-right" @click="nextRange" />
      <el-button icon="el-icon-zoom-in" type="primary" circle @click="zoomIn" />
      <el-button icon="el-icon-zoom-out" type="primary" circle @click="zoomOut" />
    </div>
    <div v-loading="loading" class="">
      <div id="chart" ref="chart" class="chart" style="margin-top:0;" :style="{height: allChartHeight + 'px'}" />
    </div>
    <div class="tools-container" style="margin-top: 25px;">
      <div class="download-container">
        <span>下载宽度：</span>
        <el-input v-model="downloadWidth" style="width: 70px;" /> px
        <el-button style="margin-left: 20px;" type="primary" @click="downloadCharts">Download <i class="el-icon-download" /></el-button>
      </div>
      <div class="gene-modes" style="margin-top: 15px">
        <!-- <el-switch
          v-model="geneSelect"
          active-text="Canomical transcript"
          inactive-text="All transcript"
        /> -->
      </div>
    </div>
  </el-card>
</template>

<script>
import { compartmentResult } from '@/api/compartment'
import * as echarts from 'echarts'
import { geneResult } from '@/api/gene'

export default {
  props: {
    filter: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      xAxiosRange: {
        minX: Infinity,
        maxX: -Infinity
      },
      firstChartHeight: 160,
      downloadWidth: '',
      geneSelect: true,
      allChartHeight: 600, // 400 + geneHeight
      compartment: [],
      loading: true,
      // 最大的y
      maxYRange: 1.6, // 动态调整为最大的+0.6
      geneHeight: 200, // 动态调整为 100 * 个数
      singleGenes: [], // 直线们 （层数 开始x 结束x
      singleArrows: [], // 箭头们 ( x 层数+0.3（从0开始 方向
      exons: [] // 层数 开始 结束 信息
    }
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
              pathData: 'M0,0 L8,0 L4,8 Z' // 箭头的路径坐标
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
        dimensions: [exon[1], exon[2], exon[3]],
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
    async handleData(filter) {
      this.compartment = []
      this.loading = true
      const range = {
        start: filter.chrStart,
        end: filter.chrEnd
      }

      let { data } = await compartmentResult(filter.chromosome.cs_ID, range)
      if (data == null) {
        data = []
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
      let maxVal = -Infinity
      const compartment = this.compartment
      for (let i = 0; i < compartment.length; ++i) {
        if (compartment[i][0] < minVal) {
          minVal = compartment[i][0]
        }
        if (compartment[i][1] < minVal) {
          minVal = compartment[i][1]
        }
        if (compartment[i][0] > maxVal) {
          maxVal = compartment[i][0]
        }
        if (compartment[i][1] > minVal) {
          maxVal = compartment[i][1]
        }
      }

      this.xAxiosRange.minX = minVal
      this.xAxiosRange.maxX = maxVal
    },
    // 处理基因数据
    async handleGeneData(filter) {
      /* eslint-disable */
      this.singleGenes = []
      this.singleArrows = []
      this.exons = []

      let res
      const range = {
        start: filter.chrStart,
        end: filter.chrEnd
      }
      let response = {data:{}}
      try {
        response = await geneResult(filter.chromosome.cs_ID, range)
        const { data } = response
        if (data === null) {
          response.data = {rnaList:[],rnaStructureTs:[]}
      }
      } catch (error) {
        response.data = {rnaList:[],rnaStructureTs:[]}
      }
      
     
      res = response.data
      const { rnaList, rnaStructureTs } = res
      if(rnaList.length === 0 && rnaStructureTs.length === 0) {
        this.loading = false
        this.$message('该区域暂无数据')
      }
      for (const item of rnaList) {
        this.singleGenes.push([0, item.start_POINT, item.end_POINT])
        this.singleArrows.push([(item.start_POINT + item.end_POINT) / 2, 0.3, item.direction === 0 ? -1 : 1])
      }
      for (const item of rnaStructureTs) {
        this.exons.push([0, item.start_POINT, item.end_POINT, item.mrna_Name])
      }

      const geneLevels = 1
      this.geneHeight = 100 * geneLevels
      this.maxYRange = geneLevels === 1 ? 0.8 : geneLevels + 0.6
      this.allChartsHeight = 300 + this.geneHeight

      let minVal = Infinity
      let maxVal = -Infinity
  
      for (let i = 0; i < rnaList.length; ++i) {
        if (rnaList[i].start_POINT < minVal) {
          minVal = rnaList[i].start_POINT
        }
        if (rnaList[i].end_POINT < minVal) {
          minVal = rnaList[i].end_POINT
        }
        if (rnaList[i].start_POINT > maxVal) {
          maxVal = rnaList[i].start_POINT
        }
        if (rnaList[i].end_POINT  > minVal) {
          maxVal = rnaList[i].end_POINT
        }
      }

      if(minVal < this.xAxiosRange.minX) this.xAxiosRange.minX = minVal
      if(maxVal > this.xAxiosRange.maxX) this.xAxiosRange.maxX = maxVal

    },
    // 渲染图
    renderChart(refName) {
      /* eslint-disable */
      const vm = this
      const option = {
        animation: false,
        // 工具栏
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
        // 直角坐标系内绘图网格
        grid: [
          this.makeGrid(40, this.firstChartHeight),
          this.makeGrid(40 + (this.firstChartHeight + 60), this.geneHeight)
        ],
        xAxis: [
          {
            gridIndex: 0,
            min: vm.xAxiosRange.minX,
            max: vm.xAxiosRange.maxX,
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
            min: vm.xAxiosRange.minX,
            max: vm.xAxiosRange.maxX,
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
    resetMinAndMax(min,max) {
      min = Math.floor(Number(min)) 
      max = Math.floor(Number(max)) 
      if(min < Number(this.filter.chrStart)) {
        min = Math.floor(this.filter.chrStart)
        console.log('中标')
      } 
      if(max > Number(this.filter.chrEnd) ) {
        max = Math.floor(this.filter.chrEnd) 
        console.log('中标')
      }
      return [Number(min),Number(max)]
    },
    async makeCharts(filter) {
      console.log('现在是：', filter.chrStart,'-',filter.chrEnd)
      echarts.dispose(document.querySelector('.chart'))
      await this.handleData(filter)
      await this.handleGeneData(filter)
      this.renderChart('chart')
    },
    // 那堆缩放事件
    // 上一个范围 （左滑）
    async lastRange() {
      if(this.xAxiosRange.minX *1000000 == this.filter.chrStart ) return
      const rangeLength = this.xAxiosRange.maxX - this.xAxiosRange.minX
      let nextMaxX = this.xAxiosRange.minX
      let nextMinX = nextMaxX - rangeLength
      let min = Math.floor(nextMinX * 1000000) 
      let max = Math.floor(nextMaxX * 1000000) 
      min = this.resetMinAndMax(min,max)[0]
      max = this.resetMinAndMax(min,max)[1]
      const filter = Object.assign({}, this.filter)
      filter.chrStart = min 
      filter.chrEnd = max 
      this.xAxiosRange.minX= min / 1000000
      this.xAxiosRange.maxX = max / 1000000
      await this.makeCharts(filter)
    },
    // 下一个范围 （右滑）
    async nextRange() {
      if(this.xAxiosRange.maxX *1000000 == this.filter.chrEnd ) return

      const rangeLength = this.xAxiosRange.maxX - this.xAxiosRange.minX
      let nextMinX = this.xAxiosRange.maxX 
      let nextMaxX = nextMinX  + rangeLength

      let min = Math.floor(this.resetMinAndMax(nextMinX*1000000,nextMaxX*1000000)[0]) 
      let max = Math.floor(this.resetMinAndMax(nextMinX*1000000,nextMaxX*1000000)[1]) 
      const filter = Object.assign({}, this.filter) 
      filter.chrStart = min
      filter.chrEnd = max
      this.xAxiosRange.minX= min / 1000000
      this.xAxiosRange.maxX = max / 1000000
      await this.makeCharts(filter)
    },
    // 放大
    async zoomIn() {
      const mid = (this.xAxiosRange.minX + this.xAxiosRange.maxX) / 2
      const rangeLength = this.xAxiosRange.maxX - this.xAxiosRange.minX
      const newRangeLength = rangeLength * 0.6
      const nextMinX = mid - newRangeLength/2
      const nextMaxX =  mid + newRangeLength/2
      let min = Math.floor(nextMinX * 1000000) 
      let max = Math.ceil(nextMaxX * 1000000) 
      min = this.resetMinAndMax(min,max)[0]
      max = this.resetMinAndMax(min,max)[1]
      const filter = Object.assign({}, this.filter)
      filter.chrStart = min
      filter.chrEnd = max
      this.xAxiosRange.minX= nextMinX 
      this.xAxiosRange.maxX = nextMaxX 
      await this.makeCharts(filter)
    },
    // 缩小
    async zoomOut() {
      const mid = (this.xAxiosRange.minX*1000000 + this.xAxiosRange.maxX*1000000) / 2
      const rangeLength = this.xAxiosRange.maxX*1000000 - this.xAxiosRange.minX*1000000
      const newRangeLength = rangeLength * 1.4
      const nextMinX = mid - newRangeLength/2
      const nextMaxX =  mid + newRangeLength/2
      let min = nextMinX 
      let max = nextMaxX
      min = this.resetMinAndMax(min,max)[0]
      max = this.resetMinAndMax(min,max)[1]
      const filter = Object.assign({}, this.filter)
      filter.chrStart = min
      filter.chrEnd = max
      this.xAxiosRange.minX= min / 1000000
      this.xAxiosRange.maxX = max / 1000000
      console.log('缩完是：', min,'-',max)
      await this.makeCharts(filter)
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
