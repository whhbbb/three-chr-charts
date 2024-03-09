<!--  -->
<template>
  <div class="ptdgm">
    <div class="tools">
      <a href="" class="tool">Documentation</a>
      <a href="" class="tool">Data downloads</a>
      <a href="" class="tool">API</a>
      <a href="" class="tool">Community</a>
    </div>
    <div class="main">
      <div class="frame">
        <div class="header">
          <div>Plant Three-Dimensional Genome Browser</div>
        </div>
        <div class="center">
          <div class="inputs">
            <div class="left-input">
              <div class="input">
                <!-- <el-input
              v-model="inputValue"
              placeholder="Search for a gene,variant,study,or trait..."
              clearable
              :class="['input-search']"
            /> -->
                <div class="inner-input">
                  <el-select v-model="postValue.species" filterable placeholder="Select species" class="my-select"
                    popper-class="ptdgm-dropdown" @change="dropDownCultivar">
                    <el-option v-for="item in options.species" :key="item" :label="item" :value="item" />
                  </el-select>
                  <span class="inner-span">eg. Oryza-sativa</span>
                </div>
                <div class="inner-input">
                  <el-select v-model="postValue.cultivar" filterable placeholder="Select cultivar" class="my-select"
                    popper-class="ptdgm-dropdown" @change="dropDownTissue">
                    <el-option v-for="item in options.cultivar" :key="item" :label="item" :value="item" />
                  </el-select>
                  <span class="inner-span">eg. MH63</span>
                </div>
              </div>
              <div class="input">
                <div class="inner-input">
                  <el-select v-model="postValue.tissue" filterable placeholder="Select tissue" class="my-select"
                    popper-class="ptdgm-dropdown" @change="dropDownChromosome">
                    <el-option v-for="item in options.tissue" :key="item" :label="item" :value="item" />
                  </el-select>
                  <span class="inner-span">eg. Leaf</span>
                </div>
                <div class="inner-input">
                  <el-select v-model="postValue.chr" filterable placeholder="Select chromosome" class="my-select"
                    popper-class="ptdgm-dropdown">
                    <el-option v-for="item in options.chr" :key="item.cs_ID" :label="item.cs_NAME"
                      :value="item.cs_NAME" />
                  </el-select>
                  <span class="inner-span">eg. Os_MH63_Chr1</span>
                </div> 
              </div>
            </div>
            <div class="right-search">
              <div style="cursor: pointer;" @click="search">
                <i class="custom-prefix-icon el-icon-search" />
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <div>
            Last updated: 2023-11-11
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { dropDownSpecies, dropDownCultivar, dropDownCultivarAll, dropDownTissue, dropDownChromosome, dropDownChromosomeAll } from '@/api/filter-table'
export default {
  name: '',
  components: {},
  data() {
    return {
      inputValue: '',
      postValue: {
        species: '',
        cultivar: '',
        tissue: '',
        chr: ''
      },
      options: {
        species: [],
        cultivar: [],
        tissue: [],
        chr: []
      }
    }
  },
  computed: {},
  watch: {},
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {

  },
  mounted() {
    this.dropDownSpecies()
  },
  methods: {
    // 查找物种
    async dropDownSpecies() {
      this.options.species = []
      const { data } = await dropDownSpecies()
      this.options.species = data.sort((a, b) => a.localeCompare(b))
    },
    // 查找组织
    async dropDownTissue() {
      this.options.tissue = []
      if (this.postValue.cultivar !== '') {
        const { data } = await dropDownTissue(this.postValue.species, this.postValue.cultivar)
        this.options.tissue = data
      }
    },
    // 查找品种
    async dropDownCultivar() {
      console.log(this.postValue.species)
      this.options.cultivar = []
      if (this.postValue.species !== '') {
        const { data } = await dropDownCultivar(this.postValue.species)
        this.options.cultivar = Array.from(new Set(data))

      } else {
        const { data } = await dropDownCultivarAll()
        this.options.cultivar = Array.from(new Set(data))
      }
    },
    // 查找染色体
    async dropDownChromosome() {
      this.options.chr = []
      if (this.postValue.cultivar !== '') {
        const { data } = await dropDownChromosome(this.postValue.species, this.postValue.cultivar)
        this.options.chr = data.sort((a,b)=>{
        return parseInt(a.cs_NAME.match(/\d+/)[0])-parseInt(b.cs_NAME.match(/\d+/)[0])
      })
      } else {
        const { data } = await dropDownChromosomeAll()
        this.options.chr = data.sort((a,b)=>{
        return parseInt(a.cs_NAME.match(/\d+/)[0])-parseInt(b.cs_NAME.match(/\d+/)[0])
      })
      }
    },
    search() {
      // 获取options中id对应的name
      if (this.postValue.species === '' || this.postValue.cultivar === '' || this.postValue.tissue === '' || this.postValue.chr === '') {
        this.$message({
          message: '请选全物种、品种、组织、染色体',
          type: 'warning'
        })
        return
      }
      this.$router.push({
        path: '/hicPictures',
        query: {
          species: this.postValue.species,
          cultivar: this.postValue.cultivar,
          tissue: this.postValue.tissue,
          chr: this.postValue.chr,
        }
      })
    }
  }
}
</script>
<style lang="scss">
.ptdgm-dropdown {
  background-color: rgba(255, 255, 255, .9);
  border: none;
}

.my-select .el-input__inner {
  border: none;
  background-color: transparent;
  font-size: 22px;
  color: saddlebrown;
  text-align: center;

  .el-select__caret {
    color: saddlebrown;
  }
}

.my-select .el-input__inner::placeholder {
  color: rgb(171, 83, 5, .5);
  text-align: center;
}

.ptdgm {
  width: 100%;
  height: 100vh;
  background-image: url(../../assets/images/cotton-bc.jpg);
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;

  .tools {
    width: 95%;
    height: 40px;
    display: flex;
    justify-content: flex-end;

    .tool {
      height: 40px;
      line-height: 40px;
      margin-right: 20px;
    }
  }

  .main {
    width: 95%;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .frame {
      width: 50%;
      height: 50%;
      background-color: #ffffffa8;
      // opacity: .5;
      display: flex;
      flex-direction: column;
      align-items: center;

      .header {
        height: 28%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2vw;
        color: rgb(82, 82, 82);
      }

      .center {
        flex: 1;
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;

        .inputs {
          display: flex;
          height: 100%;
          width: 100%;
          margin-bottom: 3%;

          .left-input {
            width: 90%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-around;

            .input {
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 2%;
              .inner-input{
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                .inner-span{
                  text-align: center;
                  width: 95%;
                  font-size: 17px;
                  color: rgba(128, 62, 4, 0.5);
                }
              }
            }
          }

          .right-search {
            flex: 1;
            display: flex;
            align-items: center;

            .custom-prefix-icon {
              margin-left: 5px;
              font-size: 25px;
              color: saddlebrown;
            }
          }
        }

        .items {
          display: flex;
          width: 100%;
          justify-content: space-between;
        }
      }

      .footer {
        height: 20%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        padding-bottom: 2%;

        div {
          margin-bottom: 2%;
        }
      }
    }
  }
}
</style>
