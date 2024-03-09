<template>
  <div class="search-filter-container">
    <el-card style="padding: 20px;">
      <div class="title">ab区 Compartment</div>
      <div class="filter-container">
        <!-- 选择物种 -->
        <div class="species-container filter-item">
          <div class="filter-name">Species</div>
          <el-select v-model="filter.species" class="filter-select" filterable placeholder="请选择物种" @focus="dropDownSpecies">
            <el-option
              v-for="item in options.species"
              :key="item.species_ID"
              :label="item.species_NAME"
              :value="item.species_ID"
            />
          </el-select>
        </div>
        <!-- 选择品种 -->
        <div class="cultivar-container filter-item">
          <div class="filter-name">Cultivar</div>
          <el-select v-model="filter.cultivar" class="filter-select" filterable placeholder="请选择品种" @focus="dropDownCultivar">
            <el-option
              v-for="item in options.cultivar"
              :key="item.cultivar_ID"
              :label="item.cultivar_NAME"
              :value="item.cultivar_ID"
            />
          </el-select>
        </div>
        <!-- 选择组织 -->
        <div class="tissue-container filter-item">
          <div class="filter-name">Tissue</div>
          <el-select v-model="filter.tissue" class="filter-select" filterable placeholder="请选择组织" @focus="dropDownTissue">
            <el-option
              v-for="item in options.tissue"
              :key="item.tissue_ID"
              :label="item.tissue_NAME"
              :value="item.tissue_ID"
            />
          </el-select>
        </div>
        <!-- 选择software -->
        <div class="software-container filter-item">
          <div class="filter-name">Software</div>
          <el-select v-model="filter.software" class="filter-select" filterable placeholder="请选择software" @focus="dropDownSoftware">
            <el-option
              v-for="item in options.software"
              :key="item.software_ID"
              :label="item.software_NAME"
              :value="item.software_ID"
            />
          </el-select>
        </div>
        <!-- 选择染色体 -->
        <div class="chr-container">
          <div style="font-size: 20px;margin-bottom: 20px;">Region</div>
          <div class="chr-filter">
            <div class="chr-item">
              <span class="chr-name" style="margin-right: 10px;font-size: 20px;">chr</span>
              <el-select v-model="filter.chromosome" class="filter-select" filterable placeholder="请选择染色体" @focus="dropDownChromosome">
                <el-option
                  v-for="item in options.chromosome"
                  :key="item.cs_ID"
                  :label="item.cs_NAME"
                  :value="item.cs_NAME"
                />
              </el-select>
            </div>
            <div class="chr-item" style="display: flex;">
              <div class="start-container" style="display: flex;">
                <span style="margin-right: 10px;font-size: 20px;line-height: 35px;">start</span>
                <el-input v-model="filter.chrStart" size="medium" />
              </div>
              <div class="end-container" style="display: flex;">
                <span style="margin:0;color: #ccc;margin: 0 10px;;font-size: 20px;line-height: 35px;">——</span>
                <span style="margin-right: 10px;font-size: 20px;line-height: 35px;">end</span>
                <el-input v-model="filter.chrEnd" size="medium" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="footer-items">
          <el-button style="margin-right: 25px;width: 130px;" @click="clearFilter">重置 <i class="el-icon-refresh-right" /></el-button>
          <el-button type="primary" style="width: 130px;" @click="submitFliter">提交 <i class="el-icon-check" /></el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { dropDownSpecies, dropDownCultivar, dropDownChromosome, dropDownCultivarAll, dropDownChromosomeAll, dropDownSoftwareAll, dropDownTissue } from '@/api/filter-table'
export default {
  data() {
    return {
      filter: {
        species: '',
        cultivar: '',
        tissue: '',
        software: '',
        chromosome: '',
        chrStart: '',
        chrEnd: ''
      },
      options: {
        species: [],
        cultivar: [],
        tissue: [],
        software: [],
        chromosome: [],
        chrStart: [],
        chrEnd: []
      }
    }
  },
  created() {
  },
  methods: {
    // 查找物种
    async dropDownSpecies() {
      const { data } = await dropDownSpecies()
      this.options.species = data
    },
    // 查找品种
    async dropDownCultivar() {
      if (this.filter.species !== '') {
        const { data } = await dropDownCultivar(this.filter.species)
        this.options.cultivar = data
      } else {
        const { data } = await dropDownCultivarAll()
        this.options.cultivar = data
      }
    },
    // 查找组织
    async dropDownTissue() {
      if (this.filter.cultivar !== '') {
        const { data } = await dropDownTissue(this.filter.cultivar)
        this.options.tissue = data
      }
    },
    // 查找software
    async dropDownSoftware() {
      const { data } = await dropDownSoftwareAll()
      this.options.software = data
    },
    // 查找染色体
    async dropDownChromosome() {
      if (this.filter.species !== '') {
        const { data } = await dropDownChromosome(this.filter.cultivar)
        this.options.chromosome = data
      } else {
        const { data } = await dropDownChromosomeAll()
        this.options.chromosome = data
      }
    },
    clearFilter() {
      this.filter.species = ''
      this.filter.cultivar = ''
      this.filter.tissue = ''
      this.filter.chromosome = ''
      this.filter.chrNum = ''
      this.filter.chrStart = ''
      this.filter.chrEnd = ''
    },
    submitFliter() {
      // 把this.filter复制到filter上，修改了原来的const filter = this.filter
      const filter = JSON.parse(JSON.stringify(this.filter))
      if (filter.chromosome === '') {
        this.$message.error('请先选择chr')
        return
      }
      if (filter.chrStart === '') {
        this.$message.error('请填写start')
        return
      }
      if (filter.chrEnd === '') {
        this.$message.error('请填写end')
        return
      }
      if (Number(filter.chrStart) >= Number(filter.chrEnd)) {
        this.$message.error('start不得大于或等于end')
        return
      }
      const chrs = this.options.chromosome
      const cultivars = this.options.cultivar
      const softwares = this.options.software
      const tissues = this.options.tissue
      for (let i = 0; i < chrs.length; ++i) {
        if (chrs[i].cs_NAME === this.filter.chromosome) {
          filter.chromosome = chrs[i]
        }
      }
      for (let i = 0; i < cultivars.length; ++i) {
        if (cultivars[i].cultivar_ID === this.filter.cultivar) {
          filter.cultivar = cultivars[i]
        }
      }
      for (let i = 0; i < tissues.length; ++i) {
        if (tissues[i].tissue_ID === this.filter.tissue) {
          filter.tissue = tissues[i]
        }
      }
      for (let i = 0; i < softwares.length; ++i) {
        if (softwares[i].software_ID === this.filter.software) {
          filter.software = softwares[i]
        }
      }
      console.log(filter)
      this.$emit('submitFliter', filter)
    }
  }
}
</script>

<style lang="scss" scoped>
$mainBlue: #33718B;
$mainRed: #A80E10;
$mainGreen: #184B45;
$lightBlue: #dfeef5;
.search-filter-container {
  width: 90%;
  min-width: 1200px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 20px;
}

.title
{
  font-size: 28px;
  line-height: 30px;
  padding-left: 10px;
  border-left: 5px solid $mainBlue;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  background-color: $lightBlue;
  margin: 20px 0;
  padding: 30px;
  .filter-item{
    // width: 33%;
    .filter-name {
      margin-bottom: 7px;
      font-size: 20px;
    }
  }
  .chr-container {
    width: 100%;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ccc;
    .chr-item {
      width: 50%;
    }
    .chr-filter {
      background-color: #fff;
      padding: 30px 20px;
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
.footer {
  width: 100%;
  position: relative;
  height: 50px;
  margin-top: 30px;
  .footer-items {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
