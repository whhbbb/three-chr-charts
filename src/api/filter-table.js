import request from '@/utils/request'

// 查找物种
export function dropDownSpecies() {
  return request({
    url: '/option/species'
  })
}

// 查找所有品种
export function dropDownCultivarAll() {
  return request({
    url: '/option/cultivar/all'
  })
}
// 根据物种查找品种
export function dropDownCultivar(speciesName) {
  return request({
    url: `/option/cultivar/species/${speciesName}`
  })
}

// 根据品种查找所有组织
export function dropDownTissue(speciesName,cultivarName) {
  return request({
    url: `/option/tissue/${speciesName}/${cultivarName}`
  })
}
// 查找所有软件
export function dropDownSoftwareAll() {
  return request({
    url: '/option/software/all'
  })
}

// 查找所有染色体
export function dropDownChromosomeAll() {
  return request({
    url: '/option/chromosome/all'
  })
}
// 根据品种查找染色体
export function dropDownChromosome(speciesName,cultivarName) {
  return request({
    url: `/option/chromosome/${speciesName}/${cultivarName}`
  })
}
// 获取显示类型选项
export function dropDownDisplayType(params) {
  return request({
    url: '/hic/getDisplayOption',
    params
  })
}

// 获取可行的标准化类型
export function dropDownNormalizationType(params) {
  return request({
    url: '/hic/getNormalizationType',
    params
  })
}

// 获得热图上的点的信息
export function getHeatmapPointInfo(params) {
  return request({
    url: '/hic/getHeatMapPoint',
    params
  })
}

// 获取品种支持的软件
export function dropDownKindSoftware(params) {
  return request({
    url: '/option/software',
    params
  })
}
