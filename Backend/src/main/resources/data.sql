INSERT IGNORE INTO services (service_id, service_name, service_type, resource_id, region, created_at) VALUES
(1, 'ec2-app-server',     'EC2', 'i-0abc123def4567890', 'us-east-1', CURRENT_TIMESTAMP),
(2, 'rds-mysql-primary',  'RDS', 'ai-root-cause-db',    'us-east-1', CURRENT_TIMESTAMP),
(3, 'app-load-balancer',  'ALB', 'app/prod-alb/50dc6c', 'us-east-1', CURRENT_TIMESTAMP);