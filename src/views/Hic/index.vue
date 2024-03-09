<!--  -->
<template>
  <div class='content'>
    <div class="turn-back">
        <router-link to="/">
          <el-button type="primary" icon="el-icon-arrow-left">Back</el-button>
        </router-link>
    </div>
    <div class="search-container" style="height: 100px;">
      <div class="tools-container">
        <div class="tool chr-selecter">
          <div class="in-content">Chromosomes</div>
          <el-select v-model="chr" filterable placeholder="select chr" @change="getHicPicture">
            <el-option v-for="item in chrs" :key="item.cs_ID" :label="item.cs_NAME" :value="item.cs_NAME" />
          </el-select>
        </div>
        <div class="tool">
          <div class="in-content">Show</div>
          <el-select v-model="show" filterable placeholder="select show" @change="getHicPicture">
            <el-option v-for="item in shows" :key="item" :label="item" :value="item" />
          </el-select>
        </div>
        <div class="tool">
          <div class="in-content">Normalization(Obs|Ctrl)</div>
          <el-select v-model="normalization" filterable placeholder="select normalization" @change="getHicPicture">
            <el-option v-for="item in normalizations" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </div>
        <div class="tool">
          <div class="in-content">Resolution(BP)</div>
          <el-slider class="slider" v-model="resolution" />
        </div>
        <div class="tool">
          <div class="in-content">Color Range</div>
          <!-- 创建一个值1-100的滑块 -->
          <el-slider class="slider" :min="1" :max="100" v-model="colorValue" @change="getHicPicture" />
        </div>
        <div class="tool">
          <div class="in-content">Goto</div>
          <!-- <el-select>
            <el-option></el-option>
          </el-select> -->
        </div>
      </div>
    </div>
    <div class="picture-container" v-loading="loading">
      <div class="support-width"></div>
      <div class="compartment-wrapper-left wrapper-left" v-if="isShowCompartment">
        <div class="compartment-show-left show-left">
          <img class="compartment-left">
        </div>
      </div>
      <div class="rna-struct-wrapper-left wrapper-left" v-if="isShowRnaStruct">
        <div class="rna-struct-show-left show-left">
          <img class="rna-struct-left">
        </div>
      </div>
      <div class="image">
        <div class="compartment-content" v-if="isShowCompartment">
          <div class="compartment-wrapper-top wrapper-top">
            <img class="compartment-top">
          </div>
          <!-- <span>Compartment:11111</span> -->
        </div>
        <div class="rna-content" v-if="isShowRnaStruct">
          <div class="rna-struct-wrapper-top wrapper-top" v-if="isShowRnaStruct">
            <img class="rna-struct-top">
          </div>
          <!-- <span>Gene:23432434</span> -->
        </div>
        <div class="hic-image">
          <div class="imag">
            <div class="x-tick" v-for="(item, index) in xTick" :key="index + 'x'"
              :style="{ top: item.y+ 'px', left: item.x }">
              <div class="x-tick-line"></div>
              <div class="x-tick-text">{{ item.label }}</div>
            </div>
            <div class="y-tick" v-for="item, index in yTick" :key="index + 'y'"
              :style="{ top: item.y , left: item.x + 'px' }">
              <div class="y-tick-text">{{ item.label }}</div>
              <div class="y-tick-line"></div>
            </div>
            <div class="img-show" @mousedown="startDrag" @mousemove="onDrag" @mouseup="stopDrag"
              @mouseleave="handleMouseLeave" @wheel="onZoom">
              <img alt="" class="img">
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="center-content">
        <div class="slider">
          <div class="title"></div>
          <el-slider v-model="scale" :min="1" :max="20" :step="0.01"/>
        </div>
      </div> -->
      <div class="right-content">
        <div class="show-content">
          <div class="tools-container">
            <div class="tool">
              <div class="in-content">Gene</div>
              <el-switch v-model="isShowRnaStruct" @change="doGetRnaStruct" />
            </div>
            <div class="tool">
              <div class="in-content">Compartment</div>
              <el-switch v-model="isShowCompartment" @change="doGetCompartment" />
            </div>
          </div>
          <div class="tools-container">
            <div class="tool">
              <div class="in-content">TAD Method</div>
              <el-select v-model="tad" filterable placeholder="choose TAD method" @change="getHicPicture">
                <el-option v-for="item in tads" :key="item" :label="item" :value="item"/>
              </el-select>
            </div>
            <div class="tool">
              <div class="in-content">Loop Method</div>
              <el-select v-model="loop" filterable placeholder="choose Loop method" @change="getHicPicture">
                <el-option v-for="item in loops" :key="item" :label="item" :value="item"/>
              </el-select>
            </div>
          </div>
          <div class="tools-container">
            <div class="tool">
              <div class="in-content">scaling ratio</div>
              <el-slider style="width:80%" v-model="scale" :min="1" :max="20" :step="0.01"/>
            </div>
            <div class="tool">
              <div class="in-content">clarity</div>
              <el-slider style="width:80%" v-model="clarity" :min="1" :max="50" :step="1"/>
            </div>
          </div>
        </div>
        <div class="point-content-wrapper">
          <div class="point-content">
            <div>The resolution of this Hi-C data is 5000bp</div>
            <div>{{ point.chromosome }}:{{ point.position }}</div>
            <div>observed value(O) = {{ point.observerValue }}</div>
            <div>expected value(E) = {{ point.expectedValue }}</div>
            <div>O/E = {{ point.oe }}</div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { dropDownChromosome, dropDownDisplayType, dropDownNormalizationType, getHeatmapPointInfo,dropDownKindSoftware } from '@/api/filter-table';

export default {
  name: '',
  components: {},
  data() {
    return {
      chr: this.$route.query.chr,
      chrs: [],
      show: 'Observed',
      shows: [],
      normalization: 'None',
      normalizations: [],
      loops:[],
      tads:[],
      loop:'',
      tad:'',
      point: {},
      resolution: 0,
      colorValue: 10,
      xStart: 0,
      xEnd: 1000,
      yStart: 0,
      yEnd: 600,
      xTick: [],
      yTick: [],
      isDragging: false,
      startDragX: 0,
      startDragY: 0,
      startDragOffsetX: 0,
      startDragOffsetY: 0,
      scale: 1,
      // 滚轮事件在短时间内是否执行过
      isScaling: false,
      // 判断是否超出
      isOver: false,
      // 用来判断是否显示基因结构图
      isShowRnaStruct: false,
      // 用来判断是否显示染色体亲缘图
      isShowCompartment: false,
      // 用来判断是否显示Loading
      loading: true,
      // 图片的宽高
      imgX:'81vh',
      imgY:'81vh',
      // 图片清晰度
      clarity:1
    };
  },
  computed: {
  },
  watch: {
    scale(){
      this.checkBoundary()
    },
    clarity(){
      this.getHicPicture()
    }
  },
  methods: {
    // 把vh转换为px
    vhToPx(vh) {
      const viewportHeight = window.innerHeight;
      const px = (vh / 100) * viewportHeight;
      return px;
    },
    async hicPicture(species, cultivar, tissue, chr, show, normalization) {
      return axios.get('http://122.205.95.110:8088/hic/generateHeatmap', {
        // 请求超时
        responseType: 'blob',
        params: {
          species: species,
          cultivar: cultivar,
          tissue: tissue,
          chromosome: chr,
          NormalizationType: normalization,
          DisplayOption: show,
          colorValue: this.colorValue,
          clarity:this.clarity
        }
      }).then((res) => {
        const reader = new FileReader(); //创建一个FileReader实例
        reader.readAsText(res.data, "utf-8"); //读取文件,结果用字符串形式表示
        reader.onload = () => {
          const imagesDom = document.querySelector('.imag');
          const imgDom = document.querySelector('.img');
          //读取完成后,获取reader.result
          try {
            const msg = JSON.parse(reader.result); //这一步报错则返回的是二进制流图片，不报错则返回的是JSON的错误提示数据
            console.log(msg)
            if (msg.code !== 200) {
              imagesDom.style.display = 'none';
              this.$message({
                message: msg.message,
                type: 'error'
              });
            }
          } catch {
            const objectURL = window.URL.createObjectURL(res.data)
            imgDom.src = objectURL;
            imagesDom.style.display = 'block';
            imgDom.style.height = this.imgY;
            imgDom.style.width = this.imgX;
            this.getRangeInshow()
          }
        };
        this.loading = false
      }).catch((err) => {
        console.log(err)
        this.loading = false
      })
    },
    async hicPicture2D(species, cultivar, tissue, chr, show, normalization) {
      return axios.get('http://122.205.95.110:8088/hic/generateHeatmap2D', {
        responseType: 'blob',
        params: {
          species: species,
          cultivar: cultivar,
          tissue: tissue,
          chromosome: chr,
          NormalizationType: normalization,
          DisplayOption: show,
          tad: this.tad===''?0:1,
          loop: this.loop===''?0:1,
          loopSoftware: this.loop,
          tadSoftware: this.tad,
          colorValue: this.colorValue,
          clarity:this.clarity
        }
      }).then(res => {
        const reader = new FileReader(); //创建一个FileReader实例
        reader.readAsText(res.data, "utf-8"); //读取文件,结果用字符串形式表示
        reader.onload = () => {
          const imagesDom = document.querySelector('.imag');
          const imgDom = document.querySelector('.img');
          //读取完成后,获取reader.result
          try {
            const msg = JSON.parse(reader.result); //这一步报错则返回的是二进制流图片，不报错则返回的是JSON的错误提示数据
            console.log(msg)
            if (msg.code !== 200) {
              imagesDom.style.display = 'none';
              this.$message({
                message: msg.message,
                type: 'error'
              });
            }
          } catch {
            const objectURL = window.URL.createObjectURL(res.data)
            imgDom.src = objectURL;
            imagesDom.style.display = 'block';
            imgDom.height = this.imgY;
            imgDom.width = this.imgX;
            this.getRangeInshow()
          }
        };
        this.loading = false
      }).catch(err => {
        console.log(err)
        this.loading = false
      })
    },
    getHicPicture() {
      this.loading = true
      if (this.tad == '' && this.loop == '') {
        this.hicPicture(this.$route.query.species, this.$route.query.cultivar, this.$route.query.tissue, this.chr, this.show, this.normalization === 'Balanced++' ? 'Balanced11' : this.normalization)
      } else {
        this.hicPicture2D(this.$route.query.species, this.$route.query.cultivar, this.$route.query.tissue, this.chr, this.show, this.normalization === 'Balanced++' ? 'Balanced11' : this.normalization)
      }
    },
    async getRnaStruct() {
      this.loading = true
      return axios.get('http://122.205.95.110:8088/RNA/RnaStruct', {
        responseType: 'blob',
        params: {
          // species: this.$route.query.species,
          // cultivar: this.$route.query.cultivar_NAME,
          // tissue: this.$route.query.tissue,
          // chromosome: this.chr,

          // 测试数据
          species: this.$route.query.species,
          cultivar: this.$route.query.cultivar,
          tissue: this.$route.query.tissue,
          chromosome: this.chr,
        }
      }).then(res => {
        const reader = new FileReader(); //创建一个FileReader实例
        reader.readAsText(res.data, "utf-8"); //读取文件,结果用字符串形式表示
        reader.onload = () => {
          const rnaStructWrapperTopDom = document.querySelector('.rna-struct-wrapper-top');
          const rnaStructTopDom = document.querySelector('.rna-struct-top');
          const rnaStructWrapperLeftDom = document.querySelector('.rna-struct-wrapper-left');
          const rnaStructLeftDom = document.querySelector('.rna-struct-left');
          try {
            const msg = JSON.parse(reader.result); //这一步报错则返回的是二进制流图片，不报错则返回的是JSON的错误提示数据
            console.log(msg)
            if (msg.code !== 200) {
              rnaStructTopDom.style.display = 'none';
              rnaStructLeftDom.style.display = 'none';
              this.$message({
                message: msg.message,
                type: 'error'
              });
            }
          } catch {
            const objectURL = window.URL.createObjectURL(res.data)
            // 上侧基因结构图渲染
            rnaStructWrapperTopDom.style.display = 'block';
            rnaStructTopDom.src = objectURL;
            rnaStructTopDom.style.height = '100%';
            rnaStructTopDom.style.width = '100%';
            // 左侧基因结构图渲染
            rnaStructLeftDom.src = objectURL;
            rnaStructLeftDom.style.height = '60px';
            rnaStructLeftDom.style.width = '81vh';
            rnaStructLeftDom.style.transform = 'rotate(90deg)';
            rnaStructLeftDom.style.transformOrigin = '30px 30px';
            ;
          }
        }
        this.loading = false
      }).catch(err => {
        console.log(err)
        this.loading = false
      })
    },
    async getCompartment() {
      this.loading = true
      return axios.get('http://122.205.95.110:8088/compartment/generate', {
        responseType: 'blob',
        params: {
          // species: this.$route.query.species,
          // cultivar: this.$route.query.cultivar_NAME,
          // tissue: this.$route.query.tissue,
          // chromosome: this.chr,
          // 测试数据
          species: this.$route.query.species,
          cultivar: this.$route.query.cultivar,
          tissue: this.$route.query.tissue,
          chromosome: this.chr,
        }
      }).then(res => {
        const reader = new FileReader(); //创建一个FileReader实例
        reader.readAsText(res.data, "utf-8"); //读取文件,结果用字符串形式表示
        reader.onload = () => {
          const compartmentWrapperTopDom = document.querySelector('.compartment-wrapper-top');
          const compartmentTopDom = document.querySelector('.compartment-top');
          const compartmentWrapperLeftDom = document.querySelector('.compartment-wrapper-left');
          const compartmentLeftDom = document.querySelector('.compartment-left');
          try {
            const msg = JSON.parse(reader.result); //这一步报错则返回的是二进制流图片，不报错则返回的是JSON的错误提示数据
            console.log(msg)
            if (msg.code !== 200) {
              compartmentTopDom.style.display = 'none';
              compartmentLeftDom.style.display = 'none';
              this.$message({
                message: msg.message,
                type: 'error'
              });
            }
          } catch {
            const objectURL = window.URL.createObjectURL(res.data)
            // 上侧基因结构图渲染
            compartmentWrapperTopDom.style.display = 'block';
            compartmentTopDom.src = objectURL;
            compartmentTopDom.style.height = '60px';
            compartmentTopDom.style.width = '100%';
            // 左侧基因结构图渲染
            compartmentLeftDom.src = objectURL;
            compartmentLeftDom.style.height = '60px';
            compartmentLeftDom.style.width = '81vh';
            compartmentLeftDom.style.transform = 'rotate(90deg)';
            compartmentLeftDom.style.transformOrigin = '30px 30px';
            ;
          }
        }
        this.loading = false
      }).catch(err => {
        console.log(err)
        this.loading = false
      })
    },
    async dropDownChromosome() {
      this.chrs = []
      const { data } = await dropDownChromosome(this.$route.query.species,this.$route.query.cultivar)
      this.chrs = data.sort((a,b)=>{
        return parseInt(a.cs_NAME.match(/\d+/)[0])-parseInt(b.cs_NAME.match(/\d+/)[0])
      })
    },
    async getAllshows() {
      this.shows = []
      const { data } = await dropDownDisplayType({ species: this.$route.query.species, cultivar: this.$route.query.cultivar, tissue: this.$route.query.tissue, chromosome: this.chr })
      this.shows = data
    },
    async getKindSoftware(){
      this.loops=[];
      this.tads=[];
      const { data } = await dropDownKindSoftware({ SpeciesName: this.$route.query.species, CultivarName: this.$route.query.cultivar, TissueName: this.$route.query.tissue })
      this.loops = data.Loop;
      this.tads = data.TAD;
    },
    async getNormalization() {
      this.normalizations = []
      const { data } = await dropDownNormalizationType({ species: this.$route.query.species, cultivar: this.$route.query.cultivar, tissue: this.$route.query.tissue, chromosome: this.chr })
      this.normalizations = data
    },
    async dropDownPoint(x, y) {
      const { data } = await getHeatmapPointInfo({ species: this.$route.query.species, cultivar: this.$route.query.cultivar, tissue: this.$route.query.tissue, chromosome: this.chr, x: parseInt(x * 1057 / 600), y: parseInt(y * 1057 / 600) })
      this.point = data
    },
    doGetRnaStruct() {
      if (this.isShowRnaStruct) {
        this.getRnaStruct()
      }
    },
    doGetCompartment() {
      if (this.isShowCompartment) {
        this.getCompartment()
      }
    },
    translatePicture() {
      const imgDom = document.querySelector('.img');
      const origin = this.vhToPx(parseInt(this.imgX.slice(0, this.imgX.length - 2)) / 2 * 0.9);
      imgDom.style.transform = `translate(${this.startDragOffsetX}px, ${this.startDragOffsetY}px) scale(${this.scale})`;
      if (this.isShowRnaStruct) {
        const rnaLeftDom = document.querySelector('.rna-struct-left');
        const rnaTopDom = document.querySelector('.rna-struct-top');
        rnaLeftDom.style.transform = "rotate(90deg)";
        rnaLeftDom.style.transform += ` translate(${this.startDragOffsetY - (this.scale - 1) * origin}px, 0) scaleX(${this.scale})`;
        rnaTopDom.style.transform = `translate(${this.startDragOffsetX}px, 0) scaleX(${this.scale})`;
      }
      if (this.isShowCompartment) {
        const compartmentLeftDom = document.querySelector('.compartment-left');
        const compartmentTopDom = document.querySelector('.compartment-top');
        compartmentLeftDom.style.transform = "rotate(90deg)";
        compartmentLeftDom.style.transform += ` translate(${this.startDragOffsetY - (this.scale - 1) * origin}px, 0) scaleX(${this.scale})`;
        compartmentTopDom.style.transform = `translate(${this.startDragOffsetX}px, 0) scaleX(${this.scale})`;
      }
    },
    startDrag(e) {
      event.preventDefault();
      console.log(e)
      this.isDragging = true;
      this.startDragX = e.clientX;
      this.startDragY = e.clientY;
    },
    onDrag(e) {
      event.preventDefault();
      this.checkBoundary()
      if (this.isDragging) {
        const deltaX = e.clientX - this.startDragX;
        const deltaY = e.clientY - this.startDragY;
        this.startDragX = e.clientX;
        this.startDragY = e.clientY;
        this.startDragOffsetX += deltaX;
        this.startDragOffsetY += deltaY;
        this.translatePicture()
      }
      // this.checkBoundary()
    },
    stopDrag() {
      event.preventDefault();
      this.checkBoundary()
      this.isDragging = false;
    },
    handleMouseLeave() {
      event.preventDefault();
      this.checkBoundary()
      this.isDragging = false;
    },
    onZoom(e) {
      event.preventDefault();
      this.checkBoundary()
      const delta = e.deltaY;
      const scale = this.scale;
      if (delta > 0) {
        this.scale -= 0.1;
      } else {
        this.scale += 0.1;
      }
      if (this.scale < 1) {
        this.scale = 1;
        if (!this.isScaling) {
          this.$message({
            message: '已经缩小到最小了',
            type: 'warning'
          });
          this.isScaling = true;
          setTimeout(() => {
            this.isScaling = false;
          }, 2000);
        }
        return
      }
      // 根据鼠标所在点缩放
      const imgDom = document.querySelector('.img-show');
      const imgRect = imgDom.getBoundingClientRect();
      this.startDragOffsetX += ((imgRect.left + imgRect.right)/2-e.clientX)*0.1;
      this.startDragOffsetY += ((imgRect.top + imgRect.bottom)/2-e.clientY)*0.1;

      this.checkBoundary()
    },
    checkBoundary() {
      const imgShowDom = document.querySelector('.img-show');
      const imgDom = document.querySelector('.img');
      const imgShowRect = imgShowDom.getBoundingClientRect();
      const imgRect = imgDom.getBoundingClientRect();
      const origin = this.vhToPx(parseFloat(this.imgX.slice(0, this.imgX.length - 2)) / 2);
      if (imgRect.left > imgShowRect.left) {
        this.startDragOffsetX = origin * (this.scale - 1);
      }
      if (imgRect.right < imgShowRect.right) {
        this.startDragOffsetX = -1*origin * (this.scale - 1);
      }
      if (imgRect.top > imgShowRect.top) {
        this.startDragOffsetY = origin * (this.scale - 1);
      }
      if (imgRect.bottom < imgShowRect.bottom) {
        this.startDragOffsetY = -1*origin * (this.scale - 1);
      }
      this.translatePicture()
      this.getRangeInshow()
    },
    changeRange() {
      const xRange = this.xEnd - this.xStart;
      const yRange = this.yEnd - this.yStart;
      this.xTick = [
        { x: '0', y: '-11', label: this.xStart.toFixed(2) },
        { x: '20%', y: '-11', label: (this.xStart + xRange * 1 / 5).toFixed(2) },
        { x: '40%', y: '-11', label: (this.xStart + xRange * 2 / 5).toFixed(2) },
        { x: '60%', y: '-11', label: (this.xStart + xRange * 3 / 5).toFixed(2) },
        { x: '80%', y: '-11', label: (this.xStart + xRange * 4 / 5).toFixed(2) },
        { x: '100%', y: '-11', label: (this.xStart + xRange * 5 / 5).toFixed(2) },
      ];
      this.yTick = [
        { x: '-50', y: '0', label: this.yStart.toFixed(2) },
        { x: '-50', y: '20%', label: (this.yStart + yRange * 1 / 5).toFixed(2) },
        { x: '-50', y: '40%', label: (this.yStart + yRange * 2 / 5).toFixed(2) },
        { x: '-50', y: '60%', label: (this.yStart + yRange * 3 / 5).toFixed(2) },
        { x: '-50', y: '80%', label: (this.yStart + yRange * 4 / 5).toFixed(2) },
        { x: '-50', y: '100%', label: (this.yStart + yRange * 5 / 5).toFixed(2) },
      ]
    },
    getRangeInshow() {
      const imgDom = document.querySelector('.img');
      const imgRect = imgDom.getBoundingClientRect();
      const imgShowDom = document.querySelector('.img-show');
      const imgShowRect = imgShowDom.getBoundingClientRect();
      this.xStart = (imgShowRect.left - imgRect.left) / this.scale;
      this.xEnd = (imgShowRect.right - imgRect.left) / this.scale;
      this.yStart = (imgShowRect.top - imgRect.top) / this.scale;
      this.yEnd = (imgShowRect.bottom - imgRect.top) / this.scale;
      this.changeRange()
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
  },
  mounted() {
    this.hicPicture(this.$route.query.species, this.$route.query.cultivar, this.$route.query.tissue, this.$route.query.chr, this.show, this.normalization === 'Balanced++' ? 'Balanced11' : this.normalization)
    this.dropDownChromosome()
    this.getAllshows()
    this.getNormalization()
    this.getKindSoftware()
    const imgDom = document.querySelector('.img');
    this.dropDownPoint(0, 0)
    imgDom.addEventListener('click', (e) => {
      // 获取图片元素的位置信息
      console.log(e)
      const imgRect = imgDom.getBoundingClientRect();
      const offsetX = e.clientX - imgRect.left;
      const offsetY = e.clientY - imgRect.top;
      this.dropDownPoint(offsetX, offsetY)
    })
  }
}
</script>
<style lang="scss">
@import "./index.scss";
</style>