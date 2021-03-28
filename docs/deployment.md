# Requirements
Before you deploy, you must have the following in place:
*  [AWS Account](https://aws.amazon.com/account/) 
*  [GitHub Account](https://github.com/) 
*  [Node 10 or greater](https://nodejs.org/en/download/) 
*  [Amplify CLI installed and configured](https://aws-amplify.github.io/docs/cli-toolchain/quickstart#quickstart) 
*  [AWS CLI installed and configured](https://aws.amazon.com/cli/) 

For prototyping, you need the following:
*  [Python 3.7 or greater](https://realpython.com/installing-python/)


# Step 1: Front-end deployment

1.  Clone this repository.
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

4.  After the Amplify deployment finishes, run the script which will setup the necessary parameters for the backend cloudformation stack.
```bash
chmod a+x ./scripts/populateParameterStore.sh \
./populateParameterStore.sh
```


# Step 2: Back-end deployment

In this step we will execute three Cloudformation scripts:
* [cfn-backend](../cfn/cfn-backend.yaml) - Responsible for the creation of the underlying infrastrucutre of the solution. It includes the EC2 Auto Scaling configuration, SQS, VPC Endpoints, EFS and CloudFront


## Step 2.1: Deploy backend cloudformation stack

1. Log into the CloudFormation Management Console.
2. Select Create stack with the With new resources option.
3. Click Upload a template file, and then Choose file and select the **cfn-backend.yaml** located at the /cfn directory of the repo
4. Click Next.
5. Name the stack (e.g. peopleCountingWithRekognition).

## Step 2.2: Upload Lambda function code

Run the script which will setup the upload the Lambda function code to AWS.
```bash
chmod a+x ./scripts/populateParameterStore.sh \
./populateParameterStore.sh
```