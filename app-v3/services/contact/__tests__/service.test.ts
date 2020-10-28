// import {getContactService} from 'app-v3/services';

// @ts-ignore
describe('ContactService', () => {
  describe('phoneNumberiteratee', () => {
    // const contactService = getContactService();
    it('should ignore phone number white space', () => {
      // expect(contactService.phoneNumberIteratee('0813 420 2889')).toBe(
      //   contactService.phoneNumberIteratee('08134202889'),
      // );
    });
    it('should match phone number country code', () => {
      // expect(contactService.phoneNumberIteratee('+234 813 420 2889')).toBe(
      //   contactService.phoneNumberIteratee('08134202889'),
      // );
    });
  });
});
