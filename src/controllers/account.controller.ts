import type { Request, Response } from 'express';
import {
  addAddress,
  getAccount,
  listAddresses,
  removeAddress,
  updateAccount,
} from '../services/account.service.js';

export async function getAccountHandler(req: Request, res: Response) {
  res.json(await getAccount(req.user!.id));
}

export async function updateAccountHandler(req: Request, res: Response) {
  res.json(await updateAccount(req.user!.id, req.body));
}

export async function listAddressesHandler(req: Request, res: Response) {
  res.json(await listAddresses(req.user!.id));
}

export async function createAddressHandler(req: Request, res: Response) {
  const address = await addAddress(req.user!.id, req.body);
  res.status(201).json(address);
}

export async function deleteAddressHandler(req: Request, res: Response) {
  await removeAddress(req.user!.id, req.params.addressId);
  res.status(204).send();
}
