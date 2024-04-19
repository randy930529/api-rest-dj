type AddressType = {
  residence: string;
  municipality: string;
  province: string;
  code: string;
};

type ProfileAddressType = {
  street?: string;
  number?: string;
  apartment?: string;
  betweenStreets?: string;
  ref?: string;
  district?: string;
  postcode?: string;
  phoneNumber?: string;
  address: AddressType;
};

export type UpdateProfileAddressDTO = {
  id: number;
  address: ProfileAddressType;
};
