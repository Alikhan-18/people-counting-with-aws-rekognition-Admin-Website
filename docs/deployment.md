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

4.  After the Amplify deployment finishes, go to the scripts directory run the [populateParameterStore.sh](../scripts/populateParameterStore.sh) script. This will setup the necessary parameters for the backend cloudformation stack.
```bash
chmod a+x ./populateParameterStore.sh \
./populateParameterStore.sh
```


# Step 2: Back-end deployment

* [cfn-backend](../backend/cfn-backend.yaml) - Responsible for the creation of the underlying infrastructure of the solution.

## Step 2.1: Deploy backend cloudformation stack

1. Log into the CloudFormation Management Console.
2. Select Create stack with the With new resources option.
3. Click Upload a template file, and then Choose file and select the **cfn-backend.yaml** file
4. Click Next.
5. Name the stack (e.g. peopleCountingWithRekognition).
6. Don't rename the parameters.

## Step 2.2: Upload Lambda function code

Run the [uploadLambdas.sh](../scripts/populateParameterStore.sh) script which will setup the upload the Lambda function code to AWS.
```bash
chmod a+x ./scripts/uploadLambdas.sh \
./scripts/uploadLambdas.sh
```