# Paladin

Slack bot for tracking user achievements within your team or company.
Paladin attributes achievements badges to members:

`/paladin give @user badge <badge-name>`

Paladin can later show other peoples badges:

`/paladin show @user badges`

You can further configure your Paladin account in our webapp in order to define available badges and distribute permissions to give out badges to users.

## Install ngrok for local development

1. create an account in ngrok; go to ngrok.com
2. download ngrok program: https://dashboard.ngrok.com/get-started/setup
3. unzip file and follow instructions "Connect your account"
4. move executable to user/local/bin
5. add the following to your bash or zsh profile:

```
export NGROK_EXEC="../../usr/local/bin/ngrok"
alias ngrok=$NGROK_EXEC
```

6. You should now be able to run `ngrok` from anywhere on your machine; for example:

```
ngrok http 4390
```

7. start local development app pointing to port 4390

```
yarn watch
```

More reading on Slack and NGROK:
https://api.slack.com/tutorials/tunneling-with-ngrok

##
