locals {
  name_prefix = "${var.project}-${var.environment}-medusa"
}

resource "aws_lightsail_key_pair" "medusa" {
  name       = "${local.name_prefix}-key"
  public_key = trimspace(file(pathexpand(var.ssh_public_key_path)))

  tags = var.tags
}

resource "aws_lightsail_instance" "medusa" {
  name              = local.name_prefix
  availability_zone = var.availability_zone
  blueprint_id      = var.blueprint_id
  bundle_id         = var.bundle_id
  key_pair_name     = aws_lightsail_key_pair.medusa.name

  add_on {
    type          = "AutoSnapshot"
    status        = var.enable_automatic_snapshots ? "Enabled" : "Disabled"
    snapshot_time = var.automatic_snapshot_time
  }

  tags = var.tags
}

resource "aws_lightsail_static_ip" "medusa" {
  name = "${local.name_prefix}-static-ip"
}

resource "aws_lightsail_static_ip_attachment" "medusa" {
  static_ip_name = aws_lightsail_static_ip.medusa.name
  instance_name  = aws_lightsail_instance.medusa.name
}

resource "aws_lightsail_instance_public_ports" "medusa" {
  instance_name = aws_lightsail_instance.medusa.name

  port_info {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
    cidrs     = ["0.0.0.0/0"]
  }

  port_info {
    protocol  = "tcp"
    from_port = 443
    to_port   = 443
    cidrs     = ["0.0.0.0/0"]
  }

  dynamic "port_info" {
    for_each = length(var.temporary_ssh_cidrs) > 0 ? [var.temporary_ssh_cidrs] : []

    content {
      protocol  = "tcp"
      from_port = 22
      to_port   = 22
      cidrs     = port_info.value
    }
  }
}
