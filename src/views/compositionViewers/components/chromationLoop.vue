<template>
  <el-card class="chromation-container">
    <div class="title">染色质环 Loop</div>
    <div class="charts-container" :style="{height: allChartsHeight+100 + 'px'}">
      <div ref="chart" class="chart" style="margin-top:0;" :style="{height: allChartsHeight + 'px'} " />
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
/* eslint-disable */

import * as echarts from 'echarts'
import { loopResult, doubleLoopResult } from '@/api/loop'
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
      geneSelect: true,
      firstChartHeight: 160,
      downloadWidth: '',
      geneHeight: 200, // 动态调整为 100 * 个数
      maxYRange: 1.6, // 动态调整为最大的+0.6
      allChartsHeight: 500, // 动态调整为300 + geneHeight
      geneData: [],
      geneLinks: [],
      loading: true,
      singleGenes: [], // 直线们 层 开始 结束
      singleArrows: [], // 箭头们 x y 方向
      exons: [], // 层 开始x 结束x 信息
      axiosRange: {
        minX: Infinity,
        maxX: -Infinity
      }
    }
  },
  async mounted() {
  },
  methods: {
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
    async handleData() {
      this.loading = true
      const vm = this

      const filter = this.filter
      let res
      if (filter.chr2Start === '' || filter.chr2End === '') {
        const range = {
          start: vm.filter.chr1Start,
          end: vm.filter.chr1End
        }
        const response = await loopResult(vm.filter.chromosome.cs_ID === '' ? 1089 : vm.filter.chromosome.cs_ID, range)
        res = response.data
      } else {
        const range = {
          start1: vm.filter.chr1Start,
          end1: vm.filter.chr1End,
          start2: vm.filter.chr2Start,
          end2: vm.filter.chr2End
        }
        const response = await doubleLoopResult(vm.filter.chromosome.cs_ID === '' ? 1089 : vm.filter.chromosome.cs_ID, range)
        res = response.data
      }
      if (res === null) {
        this.$message.error('暂无数据')
        return
      }
      // 处理每一个节点
      const dataSet = new Set()
      res.forEach(item => {
        dataSet.add(item.start_POINT)
        dataSet.add(item.end_POINT)
      })

      dataSet.forEach(item => {
        vm.geneData.push({
          name: String(item),
          value: [item, 0]
        })
      })

      dataSet.forEach(item => {
        if (item > this.axiosRange.maxX) this.axiosRange.maxX = item
        if (item < this.axiosRange.minX) this.axiosRange.minX = item
      })
      // 处理每一个关系线
      res.forEach(item => {
        vm.geneLinks.push({
          source: String(item.start_POINT),
          target: String(item.end_POINT),
          labelContent: {
            value: item.fdr_VALUE,
            ic_NUM: item.ic_NUM
          }
        })
      })
      console.log('联系的数据：', vm.geneLinks)
      let min = Infinity
      let max = -Infinity
      for (let i = 0; i < vm.geneLinks.length; i++) {
        const item = vm.geneLinks[i]
        if (item.source < min || item.target < min) {
          min = Math.min(Number(item.source), Number(item.target))
        }
        if (item.source > max || item.target > max) {
          max = Math.max(Number(item.source), Number(item.target))
        }
      }
    },
    // 初始化图像
    renderNormalChart(refName) {
      const vm = this
      const option = {
        animation: false,
        grid: [
          this.makeGrid(40, this.firstChartHeight),
          this.makeGrid(40 + (this.firstChartHeight + 60), this.geneHeight)
        ],
        xAxis: [
          {
            gridIndex: 0,
            min: vm.axiosRange.minX,
            max: vm.axiosRange.maxX,
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
            min: vm.axiosRange.minX,
            max: vm.axiosRange.maxX,
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
          }
        ],
        yAxis: [
          {
            gridIndex: 0,
            show: false,
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
            show: false,
            max: this.maxYRange,
            axisLine: {
              lineStyle: {
                color: '#000'
              }
            },
            splitLine: {}
          }
        ],
        tooltip: {
          formatter: function(params) {
            if (params.dataType === 'node') return
            if (params.componentSubType === 'graph') {
              const { value: val, ic_NUM } = params.data.labelContent || 0
              let tooltipContent = '<div style="text-align: left;">'
              tooltipContent += '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: pink; margin-right: 5px;"></span>'
              tooltipContent += 'value: ' + val + '<br>'
              tooltipContent += '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: blue; margin-right: 5px;"></span>'
              tooltipContent += 'ic_NUM: ' + ic_NUM
              tooltipContent += '</div>'
              return tooltipContent
            }
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
          // 关系图
          {
            type: 'graph',
            layout: 'none',
            coordinateSystem: 'cartesian2d',
            xAxisIndex: 0,
            yAxisIndex: 0,
            // 节点大小
            symbolSize: [5, 5],
            itemStyle: {
              color: '#1A5D7E' // 节点颜色
            },
            data: this.geneData.map(node => {
              return {
                ...node,
                label: {
                  show: false
                } // 或者设置为 false
              }
            }),
            links: this.geneLinks,
            lineStyle: {
              normal: {
                color: '#A34A49',
                opacity: 0.9,
                width: 2,
                curveness: 1
              }
            },
            label: {
              show: false
            },
            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                width: 8
              }
            }
          },
          // 下面的图
          // 绘制直线们
          ...this.makeIntrons(),
          // 绘制蓝方块们
          ...this.makeExons(),
          // 绘制箭头们
          ...this.makeArrows()
        ]
      }
      const chart = echarts.init(this.$refs[refName], 'lignt', {
        renderer: 'svg' // 指定渲染器为SVG
      })
      this.loading = false
      this.downloadWidth = chart.getWidth()
      chart.setOption(option)
    },
    async downloadCharts() {
      console.log()
      if (isNaN(this.downloadWidth)) {
        this.$message.error('请输入正确的宽度')
        return
      }
      if(this.downloadWidth < 500) {
       await  this.$confirm('为了确保文字清晰可见，不推荐下载过小的图片。我们建议您选择宽度至少为500px的图片进行下载。如果您点击确定，将为您下载宽度为500px的图片；否则，将下载您当前选择的数据所对应的图片。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
         this.downloadWidth = 500
        }).catch(() => { 
        })
      }
      const chart = echarts.getInstanceByDom(document.querySelector('.chart'))
      const orginWidth = chart.getWidth()
      const originHeight = chart.getHeight()
      const originGeneHeight = this.geneHeight
      const originFirstChartHeight = this.firstChartHeight

      this.loading = true
      this.geneHeight = this.geneHeight * this.downloadWidth / orginWidth
      this.firstChartHeight = this.firstChartHeight * this.downloadWidth / orginWidth
      await chart.resize({
        width: this.downloadWidth,
        height: this.downloadWidth / orginWidth * originHeight + 100
      })
      await this.renderNormalChart('chart')
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
      await this.renderNormalChart('chart')

      this.loading = false
    },
    async handleGeneData() {
      const filter = this.filter
      this.singleGenes = []
      this.singleArrows = []
      this.exons = []

      let res = {}
      if (filter.chr2Start === '' || filter.chr2End === '') {
        const range = {
          start: filter.chr1Start,
          end: filter.chr1End
        }
        const response = await geneResult(filter.chromosome.cs_ID, range)
        const { data } = response
        if (data === null) {
          this.$message('查询不到RNA数据')
          return
        }
        res = response.data
      } else {
        const range1 = {
          start: filter.chr1Start,
          end: filter.chr1End
        }
        const range2 = {
          start: filter.chr2Start,
          end: filter.chr2End
        }

        let res1
        let res2

        try {
          const response = await geneResult(filter.chromosome.cs_ID, range1)
          res1 = response.data 
        } catch (error) {
          res1 = null
        }

       try {
          const response = await geneResult(filter.chromosome.cs_ID, range2)
          res2 = response.data 
        } catch (error) {
          res2 = null
        }
       
        if (res1 === null  && res2 === null) {
          this.$message.error('查询不到RNA数据')
          return
        }

        if(res1 === null) {
          res.rnaList = [...res2.rnaList]
          res.rnaStructureTs = [...res2.rnaStructureTs]
        } else if(res2 === null) {
          res.rnaList = [...res1.rnaList]
          res.rnaStructureTs = [...res1.rnaStructureTs]
        } else {
          res.rnaList = [...res1.rnaList,...res2.rnaList]
          res.rnaStructureTs = [...res1.rnaStructureTs,...res2.rnaStructureTs]
        }

      }

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
      this.allChartsHeight = 300 + this.geneHeight
    },
    async makeCharts() {
      if(!this.filter.chromosome) {
        this.$message.error('请填写chr')
        return
      }
      echarts.dispose(document.querySelector('.chart'))
      this.geneData = []
      this.geneLinks = []
      this.singleArrows = []
      this.singleGenes = []
      this.exons = []
      this.axiosRange.minX = Infinity
      this.axiosRange.maxX = -Infinity
      await this.handleData()
      await this.handleGeneData()
      this.renderNormalChart('chart')
    }
  }
}
</script>

<style scoped lang="scss">
.chromation-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 900px;
  background-color
: #fff;
  margin-bottom: 50px;
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
  width: 100%;
  // height: 800px;
    .chart {
      width: 100%;
    }

}
</style>
