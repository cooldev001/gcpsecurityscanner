Steps to run the project 

Pre requisites -
-    Nodejs  
-    Project id from GCP for which scan needs to be done.
-    Service account key with permissions to access buckets in the project.
-    Refer url : https://cloud.google.com/iam/docs/creating-managing-service-account-keys

 # Run `npm install`
 # Run `node scanner.js`

 - Enter project id and respective path to service account key  when asked on the prompt

 ## Output ##

 Three files are generated in your system

 - publicBucket.json => List of buckets that are vioalting security rule by being publicly accessible.
 - nonUniformBucket.json => List of buckets that having uniform bucket-level access disabled.
 - securityReport.json => List of all buckets along with security status.

# Run `npm install`
# set environment variable GOOGLE_APPLICATION_CREDENTIALS = key.json , where key.json is the service account key that has appropriate IAM permissions for accessing buckets. 
# Run `node remediation.js`

- You will be asked for two files , you can use the ones generated from previous code namely nonUniformBucket.json and publicBucket.json respectively.

Test - Run `node scanner.js` to check. The securityReport.json will show all files as secure.
