export type RegisterInputs = {
  userName: string;
  email: string;
  password: string;
  profileImage?: string | null;
};

export type LoginInputs = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  userName: string;
  email: string;
  profileImage?: string | null;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  succesMessage: string | null;
  register: (data: RegisterInputs) => Promise<RegisterResponse | void>;
  login: (data: LoginInputs) => Promise<LoginResponse | void>;
  authCheckout: () => void;
  logout: () => void;
  clearError: () => void;
  updateProfile: (data: RegisterInputs) => Promise<void>;
};

export type RegisterResponse = {
  message?: string;
  success?: boolean;
  user?: User;
};

export type LoginResponse = {
  message?: string;
  success?: boolean;
  token?: string;
  user?: User;
};


export type TrelloReq = {
  board_name: string;
  list_name: string;
};