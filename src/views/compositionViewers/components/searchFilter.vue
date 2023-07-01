<template>
  <div class="search-filter-container">
    <el-card style="padding: 20px;">
      <div class="title">染色质环 LOOP</div>
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
        <!-- 选择组织 -->
        <div class="tissue-container filter-item">
          <div class="filter-name">Tissue</div>
          <el-select v-model="filter.cultivar" class="filter-select" filterable placeholder="请选择组织" @focus="dropDownTissue">
            <el-option
              v-for="item in options.cultivar"
              :key="item.cultivar_ID"
              :label="item.cultivar_NAME"
              :value="item.cultivar_ID"
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
                <el-input v-model="filter.chr1Start" size="medium" />
              </div>
              <div class="end-container" style="display: flex;">
                <span style="margin:0;color: #ccc;margin: 0 10px;;font-size: 20px;line-height: 35px;">——</span>
                <span style="margin-right: 10px;font-size: 20px;line-height: 35px;">end</span>
                <el-input v-model="filter.chr1End" size="medium" />
              </div>
            </div>
          </div>

          <div class="chr-filter chr-filter-range2" style="justify-content:flex-end;">
            <div class="chr-item" style="display: flex;">
              <div class="start-container" style="display: flex;">
                <span style="margin-right: 10px;font-size: 20px;line-height: 35px;">start</span>
                <el-input v-model="filter.chr2Start" size="medium" />
              </div>
              <div class="end-container" style="display: flex;">
                <span style="margin:0;color: #ccc;margin: 0 10px;;font-size: 20px;line-height: 35px;">——</span>
                <span style="margin-right: 10px;font-size: 20px;line-height: 35px;">end</span>
                <el-input v-model="filter.chr2End" size="medium" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="footer-items">
          <el-button style="margin-right: 25px;width: 130px;" @click="clearFilter">重置 <i class="el-icon-refresh-right" /></el-button>
          <el-button type="primary" style="width: 130px;" @click="submitFliter()">提交 <i class="el-icon-check" /></el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { dropDownSpecies, dropDownCultivar, dropDownChromosome, dropDownCultivarAll, dropDownChromosomeAll } from '@/api/filter-table'
export default {
  data() {
    return {
      filter: {
        species: '',
        cultivar: '',
        chromosome: '',
        chr1Start: '',
        chr1End: '',
        chr2Start: '',
        chr2End: ''
      },
      options: {
        species: [],
        cultivar: [],
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
      this.options.species = []
      const { data } = await dropDownSpecies()
      this.options.species = data
    },
    // 查找组织
    async dropDownTissue() {
      this.options.cultivar = []
      if (this.filter.species !== '') {
        const { data } = await dropDownCultivar(this.filter.species)
        this.options.cultivar = data
      } else {
        const { data } = await dropDownCultivarAll()
        this.options.cultivar = data
      }
    },
    // 查找染色体
    async dropDownChromosome() {
      this.options.chromosome = []
      if (this.filter.species !== '') {
        const { data } = await dropDownChromosome(this.filter.species)
        this.options.chromosome = data
      } else {
        const { data } = await dropDownChromosomeAll()
        this.options.chromosome = data
      }
    },
    clearFilter() {
      this.filter.species = ''
      this.filter.cultivar = ''
      this.filter.chrNum = ''
      this.filter.chromosome = ''
      this.filter.chrStart = ''
      this.filter.chrEnd = ''
    },
    submitFliter() {
      const chrs = this.options.chromosome
      const filter = this.filter
      for (let i = 0; i < chrs.length; ++i) {
        if (chrs[i].cs_NAME === this.filter.chromosome) {
          filter.chromosome = chrs[i]
        }
      }
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
  background-color: $lightBlue;
  margin: 20px 0;
  padding: 30px;
  .filter-item{
    width: 50%;
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
