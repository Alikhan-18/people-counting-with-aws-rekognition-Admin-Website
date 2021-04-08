# Requirements
Before you deploy, you must have the following in place:
*  [AWS Account](https://aws.amazon.com/account/) 
*  [GitHub Account](https://github.com/) 
*  [Node 12.6.0 or greater and NPM 6.14.10 or greater](https://nodejs.org/en/download/) 
*  [Amplify CLI installed and configured](https://aws-amplify.github.io/docs/cli-toolchain/quickstart#quickstart) 
*  [AWS CLI installed and configured](https://aws.amazon.com/cli/) 
*  [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

# Step 1: Front-end deployment

1.  Fork and clone this repository.
    If you haven't configured Amplify before, configure the Amplify CLI in your terminal as follows:
```bash
amplify configure
```

2.  In a terminal from the project root directory, enter the following command selecting the IAM user of the AWS Account you will deploy this application from. (accept all defaults):

```bash
amplify init
```
```bash
amplify init

╭─────────────────────────────────────────────╮
│                                             │
│      Update available 4.41.0 → 4.46.1       │
│   Run npm i -g @aws-amplify/cli to update   │
│                                             │
╰─────────────────────────────────────────────╯

Note: It is recommended to run this command from the root of your app directory
? Enter a name for the environment prod
? Choose your default editor: Visual Studio Code
Using default provider  awscloudformation

For more information on AWS Profiles, see:
https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

? Do you want to use an AWS profile? Yes
? Please choose the profile you want to use default
```
3.  Deploy the resource to your AWS Account using the command:
```bash
amplify push
```

4. The **Deploy to Amplify Console** button will take you to your AWS console to deploy the front-end solution.

<a href="https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/UBC-CIC/people-counting-with-aws-rekognition-Admin-Website">
    <img src="https://oneclick.amplifyapp.com/button.svg" alt="Deploy to Amplify Console">
</a>

# Step 2: Back-end deployment

* [cfn-backend](../backend/template.yaml) - Responsible for the creation of the underlying infrastructure of the solution.

Go to the **scripts** directory and run the [deploy.sh](../scripts/deploy.sh) script.

```bash
chmod a+x ./deploy.sh 
./deploy.sh
```

You will see this prompt. Use a valid email address and timezone. You will receive the login credentials for the front-end application on this
email address.
```bash
Configuring SAM deploy
======================

        Looking for config file [samconfig.toml] :  Not found

        Setting default arguments for 'sam deploy'
        =========================================
        Stack Name [sam-app]: yourstackname
        AWS Region [us-east-1]: 
        Parameter AmplifyUserPoolID [adminAmplUserPoolID]: 
        Parameter CognitoUserEmail [youremail@gmail.com]: 
        Parameter PresignedURLExpirationInSeconds [120]: 
        Parameter AmplifyAdminTableName [peopleCountingAmplifyAdminTable]: 
        Parameter AmplifyAdminBucketName [controlBucketNameAmplifyAdmin]: 
        Parameter CameraTimezone [America/Vancouver]: 
        Parameter RekognitionBucketName [rekognitionbucket-people-counting]: 
        Parameter ImageProcessingBucketName [imageprocessingbucket-people-counting]: 
        Parameter AdminIoTTopicName [takePhoto]: 
        Parameter GetPreSignedUrlIoTTopicName [s3-signed-url]: 
        #Shows you resources changes to be deployed and require a 'Y' to initiate deploy
        Confirm changes before deploy [y/N]:  
        #SAM needs permission to be able to create roles to connect to the resources in your template
        Allow SAM CLI IAM role creation [Y/n]: 
        Save arguments to configuration file [Y/n]: 
        SAM configuration file [samconfig.toml]: 
        SAM configuration environment [default]: 
```