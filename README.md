## FOVUS PROJECT

(Finished in 3 days, received on Friday and 2 weekend days passed)

This is the workflow of this project.

<img src="https://p.ipic.vip/udy7hh.png" alt="image-20240408224638612" style="zoom: 200%;" />

For setting up, you only need to set up AWS infrastructure, web portal deployed on AWS

1. Navigate to https://github.com/F0restN/FOVUS-AWS-SETUP and download it, which is the AWS infrastructure created by AWS-CDK
2. Config AWS environemnt if you didnt do that before
3. Run `cdk deploy`
4. Boom! finished, go to http://fovus-drake-client-production.s3-website.us-east-2.amazonaws.com/ and check it out.
5. Login Token: dXMtZWFzdC0yOjllYzgxNTQyLWJmZDgtNDFhZS04MjI5LWNmNTUyODlhNWFjNg==



## Bonus Feature

### Used AWS Cognito as API-Gateway Authorizer

```typescript
client = new S3Client({
  region: CURRENT_REGION,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: CURRENT_REGION },
    identityPoolId: identityPoolId,
  }),
});
dbClient = new DynamoDBClient({
  region: CURRENT_REGION,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: CURRENT_REGION },
    identityPoolId: identityPoolId,
  }),
});
docClient = DynamoDBDocumentClient.from(dbClient);
```

### Hosted in S3

URL: http://fovus-drake-client-production.s3-website.us-east-2.amazonaws.com/

### Use Flowbite TailwindCSS and ReactJS for frontend and it is responsive

<img src="https://p.ipic.vip/n8vc26.png" alt="image-20240410015033974" style="zoom:50%;" />

<img src="https://p.ipic.vip/8ttz6u.png" alt="image-20240410014953852" style="zoom:50%;" />



### Error Handle

Invalid token in login page

(Btw, the correct is: dXMtZWFzdC0yOjllYzgxNTQyLWJmZDgtNDFhZS04MjI5LWNmNTUyODlhNWFjNg==)

<img src="https://p.ipic.vip/t0mmde.png" alt="image-20240410015315323" style="zoom:50%;" />



In file upload part, notification will be sent for acknowledgement purpose

File type error

<img src="https://p.ipic.vip/yxm08c.png" alt="image-20240410015418502" style="zoom:50%;" />

File or input text empty error

<img src="https://p.ipic.vip/q33j2o.png" alt="image-20240410015536816" style="zoom:50%;" />

Upload to S3 -> Insert into DynamoDB are order in sequence. Previous workflow rejected will lead to the end of all workflow which ensure the integrity of the whole procedure.

```typescript
Promise.all([
      uploadFile2AWS(files),
      insert2DynamoDB({
        input_text: textInput,
        input_file_path: `${BUCKET_NAME}/${files.Key}.txt`,
      }),
    ])
      .then((values) => {
        toast.success('File has been uploaded!');
        setFiles({ Key: '', Body: '' });
        setTextInput('');
      })
      .catch((error) => {
        toast.error('File load error');
      });
```



### In Lambda function

```js
const { EC2Client, RunInstancesCommand } = require("@aws-sdk/client-ec2");

const SCRIPT_PATH = process.env.SCRIPT_PATH;
const REGION = process.env.REGION;
const INSTANCE_TYPE = process.env.INSTANCE_TYPE;
const INSTANCE_ROLE_ARN = process.env.INSTANCE_ROLE_ARN;
const AMI_ID = process.env.IMAGE_ID;
const KEY_NAME = process.env.KEY_NAME;
const IAM_ROLE_NAME = process.env.IAM_ROLE_NAME;
const ACCOUNT_ID = process.env.ACCOUNT_ID;

const EC2 = new EC2Client({ region: REGION });

exports.handler = async (event) => {
    try {
        for (const record of event.Records) {
            if (record.eventName === 'INSERT' && record.dynamodb.NewImage.input_text) {
                const inputId = record.dynamodb.NewImage.id.S;
                
                if(!inputId){
                    return {statusCode: 404, message: "No input file ID", body: null};
                }
                
                const initScript = `
                    #! /bin/bash
                    aws s3 cp ${SCRIPT_PATH} /tmp/script.sh
                    chmod +x /tmp/script.sh
                    /tmp/script.sh ${inputId}
                `;
                const initScriptEncoded = new Buffer(initScript).toString('base64');
            
                // Create an EC2 instance with init config to download and run script
                const response = await EC2.send(new RunInstancesCommand({
                    UserData: initScriptEncoded,
                    KeyName: KEY_NAME,
                    ImageId: AMI_ID,
                    InstanceType: INSTANCE_TYPE,
                    Monitoring: {
                        Enabled: true
                    },
                    SecurityGroups: ['launch-wizard-2'],
                    InstanceInitiatedShutdownBehavior: 'terminate',
                    IamInstanceProfile: {
                        Arn: INSTANCE_ROLE_ARN
                    },
                    MinCount: 1,
                    MaxCount: 1,
                }));
                
                if(!response.Instances || response.Instances.length <= 0){
                    return { statusCode: 503, message: "Failed creating EC2 instance", body: response};   
                }
                
                return {statusCode: 200, message: "Execution successfully", body: response};
            }
        }
    } catch (error) {
        console.error('Error:', error);
        return {statusCode: 500, message: "Error Launching EC2, input file left unprocessed", body: error};
    }
};
```





## Reference: 

https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started-browser.html

https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html

https://stackoverflow.com/questions/17533888/s3-access-control-allow-origin-header

### For API Gateway and Lambda function

Create Lambda function and integrated with API Gateway

https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-dynamo-db.html

https://docs.aws.amazon.com/whitepapers/latest/serverless-multi-tier-architectures-api-gateway-lambda/integration-with-aws-lambda.html

F

https://www.youtube.com/watch?v=lss7T0R019M

https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-generate-sdk-javascript.html

Enable  CORS

https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html

Use them in JavaScript

https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-generate-sdk-javascript.html

### For EC2

Create DynamoDB Stream + Lambda

https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ec2/command/RunInstancesCommand/

https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_ec2_code_examples.html

https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.Tutorial.html#Streams.Lambda.Tutorial.LambdaFunction

Encode script in Nodejs

https://stackoverflow.com/questions/6182315/how-can-i-do-base64-encoding-in-node-js

Unable to locate credentials

https://stackoverflow.com/questions/77232752/ec2-instance-iam-role-credentials-in-lambda-function

https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html

AWS CLi Commend & Shell Script coding 

https://docs.aws.amazon.com/cli/latest/

https://www.runoob.com/linux/linux-shell.html

Auto terminate EC2

https://serverfault.com/questions/942653/why-is-my-ec2-instance-sometimes-not-terminating-when-i-use-shutdown-now

### For CDK

https://docs.aws.amazon.com/zh_cn/lambda/latest/dg/lambda-nodejs.html

https://amazonwebshark.com/category/devops-infrastructure/

https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigatewayv2.HttpApi.html

Upload file to S3

https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3_assets-readme.html

https://docs.aws.amazon.com/cdk/v2/guide/assets.html#assets_types

Role

https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_iam.Role.html

https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_iam.ServicePrincipal.html

https://stackoverflow.com/questions/65213153/invalid-iam-instance-profile-name

https://stackoverflow.com/questions/50592591/error-with-instance-profile-role-for-emr