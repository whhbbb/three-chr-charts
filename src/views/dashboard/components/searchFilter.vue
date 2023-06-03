<template>
  <div class="search-filter-container">
    <el-card style="padding: 20px;">
      <div class="title">Filter</div>
      <div class="filter-container">
        <!-- 防止后端这块写的差，就不循环渲染了 -->
        <!-- 选择物种 -->
        <div class="species-container filter-item">
          <div class="filter-name">Species</div>
          <el-select v-model="filter.species" class="filter-select" filterable placeholder="请选择物种">
            <el-option
              label="21"
              value="123"
            />
          </el-select>
        </div>
        <!-- 选择组织 -->
        <div class="tissue-container filter-item">
          <div class="filter-name">Tissue</div>
          <el-select v-model="filter.species" class="filter-select" filterable placeholder="请选择组织">
            <el-option
              label="21"
              value="123"
            />
          </el-select>
        </div>
        <!-- 选择染色体 -->
        <div class="chr-container">
          <div style="font-size: 20px;margin-bottom: 20px;;">Region</div>
          <div class="chr-filter">
            <div class="chr-item">
              <span class="chr-name" style="margin-right: 10px;font-size: 20px;">chr</span>
              <el-select v-model="filter.species" class="filter-select" filterable placeholder="请选择染色体编号">
                <el-option
                  label="21"
                  value="123"
                />
              </el-select>
            </div>
            <div class="chr-item" style="display: flex;">
              <div class="start-container">
                <span style="margin-right: 10px;font-size: 20px;">start</span>
                <el-input v-model="filter.chrStart" size="medium" />
              </div>
              <div class="end-container">
                <span style="margin:0;color: #ccc;margin: 20px;font-size: 20px;">——</span>
                <span style="margin-right: 10px;font-size: 20px;">end</span>
                <el-input v-model="filter.chrEnd" size="medium" />
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
export default {
  data() {
    return {
      filter: {
        species: '',
        tissue: '',
        chrNum: '',
        chrStart: '',
        chrEnd: ''
      },
      options: {
        species: [],
        tissue: [],
        chrNum: [],
        chrStart: [],
        chrEnd: []
      }
    }
  },
  methods: {
    clearFilter() {
      this.filter.species = ''
      this.filter.tissue = ''
      this.filter.chrNum = ''
      this.filter.chrStart = ''
      this.filter.chrEnd = ''
    },
    submitFliter() {
      this.$emit('submitFliter', this.filter)
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
