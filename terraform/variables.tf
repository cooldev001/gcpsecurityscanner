variable "project_id" {
  description = "The ID of the project in which this bucket will be created. If this is not supplied then the project configured on the google provider will be used."
  type = string
}

variable "region" {
  description = "The region of the project in which this bucket will be created. If this is not supplied then the project configured on the google provider will be used."
  type = string
}

variable "versioning_enabled" {
  description = "If true then versioning is enabled for all objects in this bucket."
  default     = "false"
}

variable "log_bucket" {
  description = "The name of existing bucket to which access logs for this bucket should be written. If this is not supplied then no access logs are written."
  type = string
}

variable "log_object_prefix" {
  description = "The prefix for access log objects. If this is not provided then GCS defaults it to the name of the source bucket."
  type = string
}

variable "kms_key_sl" {
  description = "A self_link to a Cloud KMS key to be used to encrypt objects in this bucket, see also: https://cloud.google.com/storage/docs/encryption/using-customer-managed-keys. If this is not supplied then default encryption is used."
  type = string
}

variable "retention_policy_is_locked" {
  description = "If set to true, the bucket will be locked and any changes to the bucket's retention policy will be permanently restricted. Caution: Locking a bucket is an irreversible action."
  default     = "false"
}
variable "retention_policy_retention_period" {
  description = "The period of time, in seconds, that objects in the bucket must be retained and cannot be deleted, overwritten, or archived. The value must be less than 3,155,760,000 seconds. If this is supplied then a bucket retention policy will be created."
  type = string
}
