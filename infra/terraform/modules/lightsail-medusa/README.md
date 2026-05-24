# lightsail-medusa

Terraform module for the Medusa Lightsail compute host.

This module manages:

- imported Lightsail SSH public key
- Ubuntu Lightsail instance
- static IP and attachment
- public HTTP/HTTPS firewall ports
- temporary SSH firewall CIDRs for bootstrap
- automatic Lightsail snapshots

Do not pass a private SSH key to this module. Use `ssh_public_key_path` with a
local `.pub` file only.
