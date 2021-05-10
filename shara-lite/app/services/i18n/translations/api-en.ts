export default {
  fallbackError: {
    message: 'Oops! Something unexpected happened.',
    messageCode: 'alert.api.fallbackError',
  },
  validationError: {
    message:
      'A validation error occurred. Please correct your input and try again',
    messageCode: 'alert.api.validationError',
  },
  auth: {
    otp: {
      welcomeBack: {
        message:
          "Welcome back to Shara. We've sent an OTP to your mobile number",
        messageCode: 'alert.api.auth.otp.welcomeBack',
      },
      welcome: {
        message: "Welcome to Shara. We've sent an OTP to your mobile number",
        messageCode: 'alert.api.auth.otp.welcome',
      },
      selectCountry: {
        message: 'Please select a country',
        messageCode: 'alert.api.auth.otp.selectCountry',
      },
      fallbackError: {
        message: 'Oops! An error occurred while signing up user',
        messageCode: 'alert.api.auth.otp.fallbackError',
      },
    },
    login: {
      otpExpired: {
        message: 'OTP has expired',
        messageCode: 'alert.api.auth.login.otpExpired',
      },
      success: {
        message: 'Login Successful',
        messageCode: 'alert.api.auth.login.success',
      },
      fallbackError: {
        message: 'Invalid mobile or OTP',
        messageCode: 'alert.api.auth.login.fallbackError',
      },
    },
  },
  business: {
    notFound: {
      message: 'Business not found',
      messageCode: 'alert.api.business.notFound',
    },
    create: {
      success: {
        message: 'Business created successfully',
        messageCode: 'alert.api.business.create.success',
      },
    },
    details: {
      success: {
        message: 'Business found successfully',
        messageCode: 'alert.api.business.details.success',
      },
    },
    customerDetails: {
      notFound: {
        message: 'Customer not found',
        messageCode: 'alert.api.business.customerDetails.notFound',
      },
      success: {
        message: 'Customer found successfully',
        messageCode: 'alert.api.business.customerDetails.success',
      },
    },
    update: {
      uniqueSlug: {
        message: 'This slug has been taken already',
        messageCode: 'alert.api.business.update.uniqueSlug',
      },
      success: {
        message: 'Business updated successfully',
        messageCode: 'alert.api.business.update.success',
      },
    },
  },
  fcm: {
    addToken: {
      missingFields: {
        message: 'FCM token and platform are required',
        messageCode: 'alert.api.fcm.addToken.missingFields',
      },
      success: {
        message: 'Token updated successfully',
        messageCode: 'alert.api.fcm.addToken.success',
      },
    },
  },
  passwordReset: {
    notFound: {
      message: 'Account not found',
      messageCode: 'alert.api.passwordReset.notFound',
    },
    create: {
      success: {
        message: 'Please use the OTP sent to your mobile number',
        messageCode: 'alert.api.passwordReset.create.success',
      },
    },
    reset: {
      invalid: {
        message: 'OTP has expired or is invalid',
        messageCode: 'alert.api.passwordReset.reset.invalid',
      },
      success: {
        message: 'Password reset successful',
        messageCode: 'alert.api.passwordReset.reset.success',
      },
    },
    update: {
      uniqueSlug: {
        message: 'This slug has been taken already',
        messageCode: 'alert.api.business.update.uniqueSlug',
      },
      success: {
        message: 'Business updated successfully',
        messageCode: 'alert.api.business.update.success',
      },
    },
  },
  paymentProvider: {
    list: {
      success: {
        message: 'Payment providers retrieved successfully',
        messageCode: 'alert.api.passwordReset.create.success',
      },
    },
  },
  disbursementProvider: {
    list: {
      success: {
        message: 'Providers retrieved successfully',
      },
    },
  },
  user: {
    update: {
      success: {
        message: 'User updated successfully',
        messageCode: 'alert.api.user.update.success',
      },
    },
    userNotFound: {
      message: 'User not found',
      messageCode: 'alert.api.user.userNotFound',
    },
  },
  mPesa: {
    initiateSTKPush: {
      businessMotFound: {
        message: 'Business not found',
        messageCode: 'alert.api.mPesa.initiateSTKPush.business.notFound',
      },
      customerNotFound: {
        message: 'Business not found',
        messageCode: 'alert.api.mPesa.initiateSTKPush.customer.notFound',
      },
      mobileOrCustomer: {
        message: 'Please specify a customer or mobile number',
        messageCode:
          'alert.api.mPesa.initiateSTKPush.customer.mobileOrCustomer',
      },
      kenyaOnly: {
        message: 'Business not found',
        messageCode: 'alert.api.mPesa.initiateSTKPush.kenyaOnly.',
      },
      success: {
        message: "We've sent an STK push to your mobile number",
        messageCode: 'alert.api.mPesa.initiateSTKPush.success',
      },
      error: {
        message:
          'We were unable to send an STK push to your mobile number, please try again or contact us through the Shara mobile application',
        messageCode: 'alert.api.mPesa.initiateSTKPush.success',
      },
    },
    processValidationEvent: {
      success: {
        message: 'Validation Successful',
        messageCode: 'alert.api.mPesa.processValidationEvent.success',
      },
      error: {
        message: 'Error Validating Payment',
        messageCode: 'alert.api.mPesa.processValidationEvent.success',
      },
    },
    processConfirmationEvent: {
      success: {
        message: 'Confirmation Successful',
        messageCode: 'alert.api.mPesa.processConfirmationEvent.success',
      },
      error: {
        message: 'Error Confirming Payment',
        messageCode: 'alert.api.mPesa.processConfirmationEvent.success',
      },
    },
  },
  disbursement: {
    create: {
      notFound: {
        message: 'Your selected withdrawal method is not available',
        messageCode: 'alert.api.disbursement.create.notFound',
      },
      duplicate: {
        message:
          'Duplicate Withdrawal detected. Please wait for 5 minutes and try again',
        messageCode: 'alert.api.disbursement.create.duplicate',
      },
      multi: {
        message:
          'Multiple Withdrawals detected. Please wait for 5 minutes and try again',
        messageCode: 'alert.api.disbursement.create.multi',
      },
      success: {
        message: 'Your withdrawal has been processed successfully',
        messageCode: 'alert.api.disbursement.create.success',
      },
      insufficientBalance: {
        message: 'Your balance is insufficient for the withdrawal',
        messageCode: 'alert.api.disbursement.create.insufficientBalance',
      },
      maxAmount: {
        message: 'You cannot withdraw more than {maxAmount}',
        // messageCode: 'alert.api.disbursement.create.insufficientBalance',
      },
      error: {
        message:
          'We were unable to process your withdrawal, please try again or contact us through the Shara mobile application',
        messageCode: 'alert.api.disbursement.create.error',
      },
      noToken: {
        message:
          'We are unable to process this transaction as your PIN is required. Please update to the latest version of the Shara app to setup your PIN',
        messageCode: 'alert.api.disbursement.create.noToken',
      },
    },
  },
  disbursementMethod: {
    destroy: {
      notFound: {
        message: 'Disbursement method not found',
        messageCode: 'alert.api.disbursementMethod.destroy.notFound',
      },
      success: {
        message: 'Withdrawal method removed successfully',
        messageCode: 'alert.api.disbursementMethod.destroy.success',
      },
      error: {
        message:
          'We were unable to remove your withdrawal method, please try again or contact us',
        messageCode: 'alert.api.disbursementMethod.destroy.error',
      },
    },
  },
  approvedDrawdown: {
    create: {
      success: {
        message: 'Drawdown approved successfully',
        messageCode: 'alert.api.approvedDrawdown.create.success',
      },
      error: {
        message: 'Unable to approve drawdown for user',
        messageCode: 'alert.api.approvedDrawdown.create.error',
      },
      exists: {
        message: 'An active drawdown exists for this user',
        messageCode: 'alert.api.approvedDrawdown.create.exists',
      },
      userNotFound: {
        message: 'User not found',
        messageCode: 'alert.api.approvedDrawdown.create.userNotFound',
      },
    },
  },
  drawdown: {
    create: {
      notFound: {
        message: 'No drawdown has been approved for you',
        messageCode: 'alert.api.drawdown.create.notFound',
      },
      invalidAmount: {
        message:
          'Amount specified is more than the amount available for drawdown',
        messageCode: 'alert.api.drawdown.create.invalidAmount',
      },
      inactive: {
        message: 'Drawdown is not currently active',
        messageCode: 'alert.api.drawdown.create.inactive',
      },
      error: {
        message:
          'We were unable to process your drawdown, please try again or contact us through the Shara mobile application',
        messageCode: 'alert.api.drawdown.create.error',
      },
      success: {
        message: 'Drawdown taken successfully',
        messageCode: 'alert.api.drawdown.create.success',
      },
    },
  },
  drawdownRepayment: {
    create: {
      notFound: {
        message: 'No drawdown has been approved for you',
        messageCode: 'alert.api.drawdownRepayment.create.notFound',
      },
      complete: {
        message: "You've already finished repaying your loans",
        messageCode: 'alert.api.drawdownRepayment.create.complete',
      },
      error: {
        message:
          'We were unable to process your drawdown, please try again or contact us through the Shara mobile application',
        messageCode: 'alert.api.drawdownRepayment.create.error',
      },
      insufficientBalance: {
        message: 'Your wallet balance is not sufficient',
        messageCode: 'alert.api.drawdownRepayment.create.insufficientBalance',
      },
      success: {
        message: 'Repayment successful',
        messageCode: 'alert.api.drawdownRepayment.create.success',
      },
    },
  },
  identity: {
    verify: {
      error: {
        message:
          'We were unable to verify your identity, please try again or contact us through the Shara mobile application',
        messageCode: 'alert.api.identity.verify.error',
      },
      invalid: {
        message: 'Your ID is invalid',
        messageCode: 'alert.api.identity.verify.invalid',
      },
      success: {
        message: 'Verification successful',
        messageCode: 'alert.api.identity.verify.success',
      },
    },
    validate: {
      error: {
        message: 'OTP Validation Failed',
        messageCode: 'alert.api.identity.validate.error',
      },
      invalid: {
        message: 'Your OTP is invalid',
        messageCode: 'alert.api.identity.validate.invalid',
      },
      success: {
        message: 'OTP Validation successful',
        messageCode: 'alert.api.identity.validate.success',
      },
    },
  },
  bnplApproval: {
    create: {
      success: {
        message: 'BNPL approved successfully',
        messageCode: 'alert.api.bnplApproval.create.success',
      },
      error: {
        message: 'Unable to approve BNPL for user',
        messageCode: 'alert.api.bnplApproval.create.error',
      },
      exists: {
        message: 'An active BNPL exists for this user',
        messageCode: 'alert.api.bnplApproval.create.exists',
      },
      userNotFound: {
        message: 'User not found',
        messageCode: 'alert.api.bnplApproval.create.userNotFound',
      },
    },
    updateLimit: {
      success: {
        message: 'BNPL Limit updated successfully',
        messageCode: 'alert.api.bnplApproval.updateLimit.success',
      },
      error: {
        message: 'Unable to update BNPL limit for user',
        messageCode: 'alert.api.bnplApproval.updateLimit.error',
      },
      notFound: {
        message: 'An active BNPL does not exist for this user',
        messageCode: 'alert.api.bnplApproval.updateLimit.notFound',
      },
      userNotFound: {
        message: 'User not found',
        messageCode: 'alert.api.bnplApproval.updateLimit.userNotFound',
      },
    },
  },
  bnplDrawdown: {
    common: {
      drawdownNotFound: {
        message: 'Drawdown not found',
        messageCode: 'alert.api.bnplDrawdown.common.drawdownNotFound',
      },
      businessNotFound: {
        message: 'Business not found',
        messageCode: 'alert.api.bnplDrawdown.common.businessNotFound',
      },
      customerNotFound: {
        message: 'Customer not found',
        messageCode: 'alert.api.bnplDrawdown.common.customerNotFound',
      },
    },
    create: {
      bundleNotFound: {
        message: 'BNPL Bundle has not been approved for you',
        messageCode: 'alert.api.bnplDrawdown.create.bundleNotFound',
      },
      notFound: {
        message: 'No BNPL has been approved for you',
        messageCode: 'alert.api.bnplDrawdown.create.notFound',
      },
      duplicate: {
        message:
          'This looks like a duplicate transaction. Please wait 2 minutes to retry, if this is not an error.',
        messageCode: 'alert.api.bnplDrawdown.create.duplicate',
      },
      invalidAmount: {
        message:
          'Amount specified is more than the amount available for drawdown',
        messageCode: 'alert.api.bnplDrawdown.create.invalidAmount',
      },
      inactive: {
        message: 'Drawdown is not currently active',
        messageCode: 'alert.api.bnplDrawdown.create.inactive',
      },
      error: {
        message:
          'We were unable to process your drawdown, please try again or contact us through the Shara mobile application',
        messageCode: 'alert.api.bnplDrawdown.create.error',
      },
      success: {
        message: 'Drawdown taken successfully',
        messageCode: 'alert.api.bnplDrawdown.create.success',
      },
    },
    details: {
      success: {
        message: 'Details retrieved successfully',
        messageCode: 'alert.api.bnplDrawdown.details.success',
      },
    },
    list: {
      success: {
        message: 'Details retrieved successfully',
        messageCode: 'alert.api.bnplDrawdown.list.success',
      },
    },
  },
  bnplRepayment: {
    create: {
      notFound: {
        message: 'No BNPL has been approved for you',
        messageCode: 'alert.api.bnplRepayment.create.notFound',
      },
      complete: {
        message: "You've already finished repaying your loans",
        messageCode: 'alert.api.bnplRepayment.create.complete',
      },
      error: {
        message:
          'We were unable to process your repayment, please try again or contact us through the Shara mobile application',
        messageCode: 'alert.api.bnplRepayment.create.error',
      },
      insufficientBalance: {
        message: 'Your wallet balance is not sufficient',
        messageCode: 'alert.api.bnplRepayment.create.insufficientBalance',
      },
      success: {
        message: 'Repayment successful',
        messageCode: 'alert.api.bnplRepayment.create.success',
      },
    },
  },
  bnplKyc: {
    create: {
      success: {
        message: 'KYC Successfully Submitted',
        messageCode: 'alert.api.bnplKyc.create.success',
      },
      error: {
        message: 'Unable to submit KYC. Please try again later',
        messageCode: 'alert.api.bnplKyc.create.error',
      },
    },
    update: {
      success: {
        message: 'KYC Successfully Updated',
        messageCode: 'alert.api.bnplKyc.update.success',
      },
      error: {
        message: 'Unable to updating KYC. Please try again later',
        messageCode: 'alert.api.bnplKyc.update.error',
      },
    },
    read: {
      success: {
        message: 'KYC Successfully Retrieved',
        messageCode: 'alert.api.bnplKyc.read.success',
      },
      error: {
        message: 'Unable to retrieve KYC.',
        messageCode: 'alert.api.bnplKyc.read.error',
      },
    },
  },
  bnplBundle: {
    available: {
      success: {
        message: 'Bundle Successfully Retrieved',
        messageCode: 'alert.api.bnplBundle.available.success',
      },
      notFound: {
        message: 'Unable to retrieve Bundle. Please try again later',
        messageCode: 'alert.api.bnplBundle.available.notFound',
      },
      error: {
        message: 'Unable to retrieve Bundle. Please try again later',
        messageCode: 'alert.api.bnplBundle.available.error',
      },
    },
    create: {
      success: {
        message: 'Bundle Successfully Created',
        messageCode: 'alert.api.bnplBundle.create.success',
      },
      error: {
        message: 'Unable to create Bundle. Please try again later',
        messageCode: 'alert.api.bnplBundle.create.error',
      },
    },
    update: {
      success: {
        message: 'Bundle Successfully Updated',
        messageCode: 'alert.api.bnplBundle.update.success',
      },
      error: {
        message: 'Unable to updating Bundle. Please try again later',
        messageCode: 'alert.api.bnplBundle.update.error',
      },
      notFound: {
        message: 'Bundle not found',
        messageCode: 'alert.api.bnplBundle.update.notFound',
      },
    },
    list: {
      success: {
        message: 'Bundles Successfully Retrieved',
        messageCode: 'alert.api.bnplBundle.list.success',
      },
      error: {
        message: 'Unable to retrieve Bundles.',
        messageCode: 'alert.api.bnplBundle.list.error',
      },
    },
    read: {
      success: {
        message: 'Bundle Successfully Retrieved',
        messageCode: 'alert.api.bnplBundle.read.success',
      },
      error: {
        message: 'Unable to retrieve Bundle.',
        messageCode: 'alert.api.bnplBundle.read.error',
      },
    },
  },
  bnplCharge: {
    create: {
      success: {
        message: 'Charge Successfully Created',
        messageCode: 'alert.api.bnplCharge.create.success',
      },
      error: {
        message: 'Unable to create Charge. Please try again later',
        messageCode: 'alert.api.bnplCharge.create.error',
      },
    },
    update: {
      success: {
        message: 'Charge Successfully Updated',
        messageCode: 'alert.api.bnplCharge.update.success',
      },
      error: {
        message: 'Unable to update Charge. Please try again later',
        messageCode: 'alert.api.bnplCharge.update.error',
      },
    },
    list: {
      success: {
        message: 'Charges Successfully Retrieved',
        messageCode: 'alert.api.bnplCharge.list.success',
      },
      error: {
        message: 'Unable to retrieve Charges.',
        messageCode: 'alert.api.bnplCharge.list.error',
      },
    },
    template: {
      success: {
        message: 'Charge Template Successfully Retrieved',
        messageCode: 'alert.api.bnplCharge.template.success',
      },
      error: {
        message: 'Unable to retrieve Charge Template.',
        messageCode: 'alert.api.bnplCharge.template.error',
      },
    },
    read: {
      success: {
        message: 'Charge Successfully Retrieved',
        messageCode: 'alert.api.bnplCharge.read.success',
      },
      error: {
        message: 'Unable to retrieve Charge.',
        messageCode: 'alert.api.bnplCharge.read.error',
      },
    },
  },
  bnplProduct: {
    create: {
      success: {
        message: 'Product Successfully Created',
        messageCode: 'alert.api.bnplProduct.create.success',
      },
      error: {
        message: 'Unable to create Product. Please try again later',
        messageCode: 'alert.api.bnplProduct.create.error',
      },
    },
    update: {
      success: {
        message: 'Product Successfully Updated',
        messageCode: 'alert.api.bnplProduct.update.success',
      },
      error: {
        message: 'Unable to updating Product. Please try again later',
        messageCode: 'alert.api.bnplProduct.update.error',
      },
    },
    list: {
      success: {
        message: 'Products Successfully Retrieved',
        messageCode: 'alert.api.bnplProduct.list.success',
      },
      error: {
        message: 'Unable to retrieve Products.',
        messageCode: 'alert.api.bnplProduct.list.error',
      },
    },
    template: {
      success: {
        message: 'Product Template Successfully Retrieved',
        messageCode: 'alert.api.bnplProduct.template.success',
      },
      error: {
        message: 'Unable to retrieve Product Template.',
        messageCode: 'alert.api.bnplProduct.template.error',
      },
    },
    read: {
      success: {
        message: 'Product Successfully Retrieved',
        messageCode: 'alert.api.bnplProduct.read.success',
      },
      error: {
        message: 'Unable to retrieve Product.',
        messageCode: 'alert.api.bnplProduct.read.error',
      },
    },
  },
  sms: {
    create: {
      success: {
        message: 'Sms sent successfully',
        messageCode: 'alert.api.sms.create.success',
      },
      missingFields: {
        message: 'To & Message are required',
        messageCode: 'alert.api.sms.create.missingFields',
      },
      error: {
        message: 'Unable to send SMS. Please try again later',
        messageCode: 'alert.api.sms.create.error',
      },
    },
  },
  cashback: {
    process: {
      success: {
        message: 'Cashback processed successfully',
        messageCode: 'alert.api.cashback.process.success',
      },
    },
  },
  pin: {
    create: {
      success: {
        message: 'Transaction PIN set successfully',
        messageCode: 'alert.api.pin.create.success',
      },
      notTwice: {
        message: 'Transaction PIN cannot be set twice',
        messageCode: 'alert.api.pin.create.notTwice',
      },
    },
    update: {
      success: {
        message: 'Transaction PIN updated successfully',
        messageCode: 'alert.api.pin.update.success',
      },
      notSet: {
        message: 'Transaction PIN has not been set',
        messageCode: 'alert.api.pin.update.notSet',
      },
    },
    verify: {
      success: {
        message: 'Transaction PIN has been verified',
        messageCode: 'alert.api.pin.verify.success',
      },
    },
    status: {
      success: {
        message: 'Transaction PIN status retrieved successfully',
        messageCode: 'alert.api.pin.status.success',
      },
    },
    invalid: {
      message: 'Transaction PIN Invalid',
      messageCode: 'alert.api.pin.invalid',
    },
  },
  securityQa: {
    create: {
      success: {
        message: 'Security Question Saved Successfully',
        messageCode: 'alert.api.securityQa.create.success',
      },
    },
    retrieve: {
      success: {
        message: 'Security Question retrieved successfully',
        messageCode: 'alert.api.securityQa.retrieve.success',
      },
    },
    verify: {
      success: {
        message: 'Security QA answer verified',
        messageCode: 'alert.api.securityQa.verify.success',
      },
    },
    notSet: {
      message: 'Security Question not set',
      messageCode: 'alert.api.securityQa.notSet',
    },
    invalid: {
      message: 'Security QA answer invalid',
      messageCode: 'alert.api.securityQa.invalid',
    },
  },
};
