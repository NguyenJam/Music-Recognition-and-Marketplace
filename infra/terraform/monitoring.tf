resource "aws_cloudwatch_dashboard" "service_monitoring" {
  dashboard_name = "Melodex-Service-Monitoring"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        x = 0
        y = 0
        width = 12
        height = 6
        properties = {
          view = "timeSeries"
          region = var.aws_region
          title = "ECS service CPU and memory"
          period = 60
          stat = "Average"
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ClusterName", aws_ecs_cluster.application.name, "ServiceName", aws_ecs_service.application.name],
            ["AWS/ECS", "MemoryUtilization", "ClusterName", aws_ecs_cluster.application.name, "ServiceName", aws_ecs_service.application.name]
          ]
          yAxis = { left = { min = 0, max = 100, label = "Percent" } }
        }
      },
      {
        type = "metric"
        x = 12
        y = 0
        width = 12
        height = 6
        properties = {
          view = "timeSeries"
          region = var.aws_region
          title = "Healthy application targets"
          period = 60
          stat = "Minimum"
          metrics = [["AWS/ApplicationELB", "HealthyHostCount", "LoadBalancer", aws_lb.application.arn_suffix, "TargetGroup", aws_lb_target_group.application.arn_suffix]]
          yAxis = { left = { min = 0, label = "Targets" } }
        }
      },
      {
        type = "metric"
        x = 0
        y = 6
        width = 12
        height = 6
        properties = {
          view = "timeSeries"
          region = var.aws_region
          title = "Application response time"
          period = 60
          stat = "Average"
          metrics = [["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.application.arn_suffix, "TargetGroup", aws_lb_target_group.application.arn_suffix]]
          yAxis = { left = { min = 0, label = "Seconds" } }
        }
      },
      {
        type = "metric"
        x = 12
        y = 6
        width = 12
        height = 6
        properties = {
          view = "timeSeries"
          region = var.aws_region
          title = "Target server errors"
          period = 60
          stat = "Sum"
          metrics = [["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", aws_lb.application.arn_suffix, "TargetGroup", aws_lb_target_group.application.arn_suffix]]
          yAxis = { left = { min = 0, label = "Responses" } }
        }
      }
    ]
  })
}
