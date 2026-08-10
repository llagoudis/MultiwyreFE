import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";

export type OrgPermGroup = { group: string; perms: string[] };
export type OrgRole = { id: number; name: string; perms: string[] };
export type OrgUser = {
  id: number;
  email: string;
  role: string;
  roleId: number | null;
  joined: [string, string];
};

export const getOrgPermissions = (): APIFunction<OrgPermGroup[]> =>
  ApiHandler(() => ProtectedAxiosInstance.get("/org/permissions"));

export const getOrgRoles = (): APIFunction<OrgRole[]> =>
  ApiHandler(() => ProtectedAxiosInstance.get("/org/roles"));

export const createOrgRole = (data: {
  name: string;
  perms: string[];
}): APIFunction<OrgRole> =>
  ApiHandler(() => ProtectedAxiosInstance.post("/org/roles", data));

export const updateOrgRole = (
  id: number,
  data: { name?: string; perms?: string[] },
): APIFunction<OrgRole> =>
  ApiHandler(() => ProtectedAxiosInstance.patch(`/org/roles/${id}`, data));

export const deleteOrgRole = (id: number): APIFunction<{ id: number }> =>
  ApiHandler(() => ProtectedAxiosInstance.delete(`/org/roles/${id}`));

export const getOrgUsers = (): APIFunction<OrgUser[]> =>
  ApiHandler(() => ProtectedAxiosInstance.get("/org/users"));

export const createOrgUser = (data: {
  email: string;
  password: string;
  roleId?: number | null;
}): APIFunction<OrgUser> =>
  ApiHandler(() => ProtectedAxiosInstance.post("/org/users", data));

export const updateOrgUser = (
  id: number,
  data: { email?: string; roleId?: number | null; password?: string },
): APIFunction<OrgUser> =>
  ApiHandler(() => ProtectedAxiosInstance.patch(`/org/users/${id}`, data));

export const deleteOrgUser = (id: number): APIFunction<{ id: number }> =>
  ApiHandler(() => ProtectedAxiosInstance.delete(`/org/users/${id}`));
