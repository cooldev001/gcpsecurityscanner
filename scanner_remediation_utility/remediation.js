const { Storage } = require("@google-cloud/storage");
const readline = require("readline");
const fs = require("fs");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

var bucketList, publicBucketList;
process.env.GOOGLE_APPLICATION_CREDENTIALS = "key.json";
const storage = new Storage();

rl.question(
  "Please enter the list of buckets to be remediated for uniform bucket level access ? ",
  function (file) {
    fs.readFile(file, (err, data) => {
      if (err) {
        console.log("there seems to be a problem with file or you have not enetered one");
      } else {
        bucketList = JSON.parse(data);
        bucketList.forEach((bucket) => {
          enableUniformBucketLevelAccess(bucket.name).catch(console.error);
        });
      }
    });

    rl.question(
      "Please enter the list of buckets to be remediated for public level access? ",
      function (file) {
        fs.readFile(file, (err, data) => {
          if (err) {
            console.log("there seems to be a problem with file or you have not enetered one");
          } else {
            publicBucketList = JSON.parse(data);
            publicBucketList.forEach((bucket) => {
              console.log(bucket);
              makeBucketPrivate(
                bucket.name,
                bucket.member,
                bucket.roleName
              ).catch(console.error);
            });
          }
        });
        rl.close();
      }
      
    );

    async function enableUniformBucketLevelAccess(bucketName) {
      // Disables uniform bucket-level access for the bucket
      await storage.bucket(bucketName).setMetadata({
        iamConfiguration: {
          uniformBucketLevelAccess: {
            enabled: true,
          },
        },
      });
      console.log(`Uniform bucket-level access was enabled for ${bucketName}.`);
    }

    async function makeBucketPrivate(bucketName, members, roleName) {
      console.log(members, roleName);
      const bucket = storage.bucket(bucketName);
      const [policy] = await bucket.iam.getPolicy({
        requestedPolicyVersion: 3,
      });

      // Finds and updates the appropriate role-member group, without a condition.
      const index = policy.bindings.findIndex(
        (binding) => binding.role === roleName && !binding.condition
      );

      const role = policy.bindings[index];
      if (role) {
        role.members = role.members.filter(
          (member) => members.indexOf(member) === -1
        );
        if (role.members.length === 0) {
          policy.bindings.splice(index, 1);
        } else {
          policy.bindings.index = role;
        }

        console.log("*******policy*******", policy);

        // Updates the bucket's IAM policy
        await bucket.iam.setPolicy(policy);
      } else {
        // No matching role-member group(s) were found
        throw new Error("No matching role-member group(s) found.");
      }
      console.log(
        `Removed the following member(s) with role from ${bucketName}:`
      );
    }
  }
);
