import request from '@/utils/request'

// 事件管理相关API
export function getEventList(params) {
  return request({
    url: '/ops-service/events',
    method: 'get',
    params
  })
}

// 工单管理相关API
export function getTicketList(params) {
  return request({
    url: '/ops-service/tickets',
    method: 'get',
    params
  })
}

// 获取服务列表
export function getServiceList(params) {
  return request({
    url: '/ops-service/service-catalog',
    method: 'get',
    params
  })
}

// 申请单个服务
export function applyService(data) {
  return request({
    url: '/ops-service/service-catalog/apply',
    method: 'post',
    data
  })
}

// 批量申请服务
export function batchApplyService(data) {
  return request({
    url: '/ops-service/service-catalog/batch-apply',
    method: 'post',
    data
  })
}

// 获取服务详情
export function getServiceDetail(id) {
  return request({
    url: `/ops-service/service-catalog/${id}`,
    method: 'get'
  })
}

// 其他API... 