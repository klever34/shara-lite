fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew install fastlane`

# Available Actions
## Android
### android test
```
fastlane android test
```
Runs all the tests
### android testlab
```
fastlane android testlab
```
Submit a new build to Firebase Test Lab
### android internal
```
fastlane android internal
```
Submit a new build to Firebase App Distribution
### android playinternalappsharing
```
fastlane android playinternalappsharing
```
Deploy a new version to the Google Play Internal Test Release
### android play
```
fastlane android play
```
Deploy a new version to the Google Play lane internal

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
