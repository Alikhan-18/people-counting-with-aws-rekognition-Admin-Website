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

3.  Deploy the resourse to your AWS Account using the command:
```bash
amplify push
```

4.  After the Amplify deployment finishes, go to the **scripts** directory and run the [populateParameterStore.sh](../scripts/populateParameterStore.sh) script. 
    This will setup the necessary parameters for the backend cloudformation stack:
```bash
chmod a+x ./populateParameterStore.sh 
./populateParameterStore.sh
```

5. The **Deploy to Amplify Console** button will take you to your AWS console to deploy the front-end solution.

<a href="https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/UBC-CIC/people-counting-with-aws-rekognition-Admin-Website">
    <img src="https://oneclick.amplifyapp.com/button.svg" alt="Deploy to Amplify Console">
</a>

# Step 2: Back-end deployment

* [cfn-backend](../backend/template.yaml) - Responsible for the creation of the underlying infrastructure of the solution.

Use a valid email address and timezone. You will receive the login credentials for the front-end application on this
email address.


## Step 3: Setting up user and admin front-end applications.

In this section we will update the front-end application code to enable the communication with AWS IoT Core.

1.Select the stack that you created in Cloudformation. Click on **Resources** in the right pane :

2.You should find clickable links for resources named **ApiKeyDeveloperEndpoint** and **ApiKeyIoT**.

Click on **Show**. Make note of the API key that is displayed to you. 

3.Select outputs section of your cloudformation stack.

Make note of the **IoTEndpoint** and **DeveloperEndpoint** urls.

Paste the API key and endpoint url into the appropriate fields in the [secrets](../src/secrets.json) file. 