provider "google" {
  credentials = file("terraformkey.json")
  project     = var.project_id 
  region      = var.region 
}

// Terraform plugin for creating random ids
resource "random_id" "bucket_id" {
 byte_length = 8
}

resource "google_storage_bucket" "bucket" {
  count    = 2
  name     = "bucket-${random_id.bucket_id.hex}-${count.index}"
  location = "EU"
  // for access to be managed by IAM
  uniform_bucket_level_access = true
  versioning {
    enabled = var.versioning_enabled
  }

  dynamic "logging" {
    for_each = var.log_bucket == "" ? [] : [1]
    content {
      log_bucket        = var.log_bucket
      log_object_prefix = var.log_object_prefix
    }
  }

  dynamic "encryption" {
    for_each = var.kms_key_sl == "" ? [] : [1]
    content {
      default_kms_key_name = var.kms_key_sl
    }
  }

  dynamic "retention_policy" {
    for_each = var.retention_policy_retention_period == "" ? [] : [1]
    content {
      is_locked        = var.retention_policy_is_locked
      retention_period = var.retention_policy_retention_period
    }
  }
}

### The code below should be uncommented if you have an organization id.

/* #domain restricted sharing

module "org-policy_domain_restricted_sharing" {
  source  = "terraform-google-modules/org-policy/google//modules/domain_restricted_sharing"
  version = "3.0.2"
  domains_to_allow  = var.domains
  folder_id = var.folder
  organization_id = var.organization
  policy_for = "project"
  project_id = var.project
}

# Set up of Shared Perimeter

module "org_policy" {
  source      = "terraform-google-modules/vpc-service-controls/google"
  parent_id   = var.parent_id
  policy_name = var.policy_name
}

module "access_level_members" {
  source  = "terraform-google-modules/vpc-service-controls/google//modules/access_level"
  policy  = module.org_policy.policy_id
  name    = "terraform_members"
  members = var.members
}

module "regular_service_perimeter_1" {
  source              = "terraform-google-modules/vpc-service-controls/google//modules/regular_service_perimeter"
  policy              = module.org_policy.policy_id
  perimeter_name      = var.perimeter_name
  description         = var.perimeter_description // "Perimeter shielding projects"
  resources           = var.perimeter_resources // ["symbolic-yen-269506"]
  access_levels       = [module.access_level_members.name]
  restricted_services = ["storage.googleapis.com"]
}
 */