# mobile
Shara Mobile App built with React Native

# Run Locally
1. Pull Repository and checkout `discovery` branch
2. Change directory into repo i.e. `cd mobile`
3. Install dependencies `yarn install`
4. Set environment variables in `.env` using `.env.sample` as a template
5. Run Locally `yarn android`

# Developer Workflow

1. Setup Gitflow i.e. `git flow init`
    - Use `master` as production release
    - Use `discovery` branch as next release branch
    - Other defaults are okay
2. Create `feature` or `bugfix` b ranch
    ```bash
   git flow feature start chatbot
    ```
3. One completion, publish branch
    ```bash
    git flow feature publish 
    ```
4. Create a Pull Request using template provided

# Documentation
CI-CD Pipeline automatically versions and deploys to either Firebase App Distribution or the Google Play Store. Read 
[DevOps Documentation](https://www.notion.so/DevOps-Documentation-c0685a3f275048d2857cdd6b49919aa1) for more information.

# Release Notes
[Release Notes](https://www.notion.so/Shara-App-release-notes-d3f49cb27acc477d802659a7b809df5a) are documented here
