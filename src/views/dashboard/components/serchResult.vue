<template>
  <div class="main-bfc-container">
    <div class="chr-main-container">
      <img class="main-bg" src="@/assets/images/maib-R-C.jpg" alt="">
      <el-button type="primary" style="width:180px;height: 50px;position: absolute;" @click="returnSearchFilter()"><i class="el-icon-arrow-left" />&nbsp;&nbsp;&nbsp;返回</el-button>

      <div class="charts-container">
        <div class="tree-branch">

          <div class="branch-chromation-container">
            <div class="main-branch main-branch01" />
            <div class="sub-branch sub-branch01" />
            <div class="chromation-container">
              <ChromationVue />
            </div>
            <div class="circle" />
          </div>

          <div class="branch-tad-container">
            <div class="main-branch main-branch02" />
            <div class="sub-branch sub-branch02" />
            <div class="chr-container">
              <ChrVue />
            </div>
            <div class="circle" />
          </div>

          <div class="branch-abviewer-container">
            <div class="main-branch main-branch03" />
            <div class="circle" />
            <div class="sub-branch sub-branch03" />
            <div class="ab-viewer-container">
              <AbViewerVue />
            </div>
          </div>

          <div class="main-branch" style="height: 700px;background: linear-gradient(to bottom,#fff,#031720);" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChrVue from './chr.vue'
import AbViewerVue from './abViewer.vue'
import ChromationVue from './chromation.vue'
export default {
  name: 'Home',
  components: { ChrVue, AbViewerVue, ChromationVue },
  methods: {
    returnSearchFilter() {
      this.$emit('returnSearchFilter', false)
    }
  }
}
</script>

<style scoped lang="scss">
.chr-main-container {
  width: 100%;
  position: relative;
  height: 70vw;
  background-color: #051F2C;
  .main-bg {
    position: absolute;
    opacity: 0.04;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.charts-container {
  position: relative;
  width: 90%;
  max-width: 2200px;
  left: 50%;
  transform: translateX(-50%);
}

.tree-branch {
  position: absolute;
  left: 50%;
  height: 500px;

  .main-branch {
    width: 3px;
    // height: 100%;
    background-color: #fff;
    transform: translateX(-50%);
  }

  .main-branch01 {
    height: 50px;
  }
  .main-branch02 {
    height: 200px;
  }

  .circle {
    margin: 8px 0;
    width: 15px;
    height: 15px;
    border: 3px solid #fff;
    border-radius: 15px;
    transform: translateX(-50%);
    opacity: 0.8;
  }
   .sub-branch {
    position: absolute;
      height: 2px;
      background: linear-gradient(to left, #fff,#051F2C);
      transform: translateX(-110%);
      opacity: 0.8;
      border-radius: 3px;
    }

  .branch-chromation-container {
    position: relative;

    .chromation-container {
      position: absolute;
      left: 0;
      margin-top: 30px;
      transform: translateX(-120%);
    }

    .sub-branch01 {
      width: 230px;
      margin-top: 15px;
    }
  }

  .branch-tad-container {
    position: relative;

    .chr-container {
      position: absolute;
      margin-top: 50px;
      margin-left: 35px;
    }

    .sub-branch02 {
      transform: translateX(30px) rotate(180deg);
      width: 400px;
      margin-top: 15px;
    }
  }

  .branch-abviewer-container {
    position: relative;

    .main-branch03 {
      height: 440px;
    }

    .ab-viewer-container {
      position: absolute;
      transform: translateX(-120%);
      margin-top: 10px;
    }

    .sub-branch03 {
      width: 230px;
      margin-top: -20px;
    }
  }
}
.container {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
}

.charts-container {
  display: flex;
  flex-wrap: wrap;
}
</style>
