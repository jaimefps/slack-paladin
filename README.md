# Paladin

# TODO create dev setup docs

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

## ...
