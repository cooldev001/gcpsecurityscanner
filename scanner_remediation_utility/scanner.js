const { Storage } = require("@google-cloud/storage");
const readline = require("readline");
const fs = require("fs");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

var bucketArray = [];

rl.question("Please enter your project ID ? ", function (name) {
  process.env.GCP_PROJECT = name;
  rl.question("Please enter path of service account key? ", function (creds) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = creds;
    const storage = new Storage();
    async function listBuckets() {
      // Lists all buckets in the current project
      const [buckets] = await storage.getBuckets({ project: name });
      buckets.forEach((bucket) => {
        bucket.getMetadata().then(function (data) {
          const metadata = data[0];
          viewBucketIamMembers(
            bucket.name,
            metadata.iamConfiguration.uniformBucketLevelAccess.enabled
          ).catch(console.error);
        });
      });
    }

    listBuckets().catch(console.error);

    async function viewBucketIamMembers(name, enabled) {
      let bucketObject = {};
      let role = [];
      let bucketMembers = [];
      let bucketNames,
        secureBucketNames = [];
      // Gets and displays the bucket's IAM policy
      const results = await storage
        .bucket(name)
        .iam.getPolicy({ requestedPolicyVersion: 3 });
      const bindings = results[0].bindings;
      // Displays the roles in the bucket's IAM policy
      for (const binding of bindings) {
        role.push(binding.role);
        const members = binding.members;
        for (const member of members) {
          bucketMembers.push({ m: member, b: binding.role });
        }
      }

      bucketObject.name = name;
      bucketObject.enabled = enabled;
      bucketObject.role = role;
      bucketObject.members = bucketMembers;
      bucketArray.push(bucketObject);
      fs.writeFileSync("result.json", JSON.stringify(bucketArray));

      bucketArray.forEach((element) => {
        element.members.forEach((member) => {
          if (member.m.indexOf("allUsers") > -1) {
            secureBucketNames.push({ name: element.name, secure: false });
            bucketNames.push({
              name: element.name,
              roleName: member.b,
              member: member.m,
            });
            fs.writeFileSync("publicBucket.json", JSON.stringify(bucketNames));
          }
        })
        bucketNames = [];
        if (element.enabled === false) {
          secureBucketNames.push({ name: element.name, secure: false });
          bucketNames.push({ name: element.name });
          fs.writeFileSync(
            "nonUniformBucket.json",
            JSON.stringify(bucketNames)
          );
        } else {
          secureBucketNames.push({ name: element.name, secure: true });
        }
        fs.writeFileSync("securityReport.json",JSON.stringify(secureBucketNames));
      });
    }
    rl.close();
  });
});
