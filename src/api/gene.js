import request from '@/utils/request'

export function geneResult(id, params) {
  return request({
    url: `/RNA/cs_id/${id}`,
    params
  })
}
