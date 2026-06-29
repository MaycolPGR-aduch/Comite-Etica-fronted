"use client";

import { useMemo, useState } from "react";

import {
  useCreateUser,
  useDeactivateUser,
  useUpdateUser,
  useUserById,
  useUsers,
} from "@/hooks";
import type { InternalRole, Role } from "@/types";
import { PageHeader, TableSkeleton, useConfirm } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Opciones para EDITAR un usuario existente (incluye los roles auto-registrables
// para que el rol de estudiantes/investigadores se muestre bien en el selector).
const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: "estudiante_pregrado", label: "Estudiante de pregrado" },
  { value: "estudiante_postgrado", label: "Estudiante de postgrado" },
  { value: "investigador", label: "Investigador" },
  { value: "secretaria", label: "Secretaria tecnica" },
  { value: "coordinador", label: "Coordinador" },
  { value: "evaluador", label: "Evaluador" },
  { value: "administrador", label: "Administrador" },
];

// El administrador SOLO puede CREAR credenciales de roles internos.
// Los estudiantes (pregrado/postgrado) e investigadores se auto-registran.
const INTERNAL_ROLE_OPTIONS: Array<{ value: InternalRole; label: string }> = [
  { value: "secretaria", label: "Secretaria tecnica" },
  { value: "coordinador", label: "Coordinador" },
  { value: "evaluador", label: "Evaluador" },
  { value: "administrador", label: "Administrador" },
];

const EMPTY_CREATE_FORM = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  rol: "secretaria" as InternalRole,
};

export default function UsuariosAdminPage() {
  const { data: users = [], isLoading, error } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deactivateUserMutation = useDeactivateUser();
  const confirm = useConfirm();

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftRole, setDraftRole] = useState<Role | null>(null);
  const [draftActivo, setDraftActivo] = useState<boolean | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createError, setCreateError] = useState<string | null>(null);

  const openCreateDialog = () => {
    setCreateError(null);
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    setCreateError(null);

    const nombre = createForm.nombre.trim();
    const apellido = createForm.apellido.trim();
    const email = createForm.email.trim();

    if (!nombre || !apellido || !email || !createForm.password) {
      setCreateError("Completa todos los campos.");
      return;
    }
    if (createForm.password.length < 8) {
      setCreateError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        nombre,
        apellido,
        email,
        password: createForm.password,
        rol: createForm.rol,
      });
      setCreateOpen(false);
      setCreateForm(EMPTY_CREATE_FORM);
      toast.success("Usuario creado", "La credencial interna se creó correctamente.");
    } catch (createErr) {
      const message =
        createErr instanceof Error ? createErr.message : "No se pudo crear el usuario.";
      setCreateError(message);
      toast.error("No se pudo crear el usuario", message);
    }
  };

  const {
    data: selectedUser,
    isLoading: loadingSelectedUser,
    error: selectedUserError,
  } = useUserById(selectedUserId);

  const selectedUserName = useMemo(() => selectedUser?.nombre ?? "", [selectedUser]);
  const selectedRole = draftRole ?? selectedUser?.role ?? "investigador";
  const selectedActivo = draftActivo ?? (selectedUser?.activo ?? true);

  const openEditDialog = (userId: string) => {
    setUiError(null);
    setSelectedUserId(userId);
    setDraftRole(null);
    setDraftActivo(null);
    setDialogOpen(true);
  };

  const closeEditDialog = () => {
    setDialogOpen(false);
    setSelectedUserId("");
    setDraftRole(null);
    setDraftActivo(null);
  };

  const handleSave = async () => {
    if (!selectedUserId) return;

    setUiError(null);

    try {
      await updateUserMutation.mutateAsync({
        id: selectedUserId,
        data: {
          rol: selectedRole,
          activo: selectedActivo,
        },
      });
      closeEditDialog();
      toast.success("Usuario actualizado", "Los cambios se guardaron correctamente.");
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "No se pudo actualizar el usuario.";
      setUiError(message);
      toast.error("No se pudo actualizar el usuario", message);
    }
  };

  const handleDeactivate = async (userId: string) => {
    const shouldDeactivate = await confirm({
      title: "Desactivar usuario",
      description:
        "El usuario quedará inactivo y no podrá acceder al sistema. ¿Deseas continuar?",
      confirmLabel: "Desactivar",
      variant: "destructive",
    });

    if (!shouldDeactivate) return;

    setUiError(null);

    try {
      await deactivateUserMutation.mutateAsync(userId);
      toast.success("Usuario desactivado", "El usuario ya no podrá acceder al sistema.");
    } catch (deactivateError) {
      const message =
        deactivateError instanceof Error
          ? deactivateError.message
          : "No se pudo desactivar el usuario.";
      setUiError(message);
      toast.error("No se pudo desactivar el usuario", message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Gestión de usuarios"
          description="Listar, ver detalle, actualizar y desactivar usuarios del sistema."
        />
        <Button onClick={openCreateDialog} className="font-semibold">
          + Crear usuario interno
        </Button>
      </div>
      <Card>
        <CardContent className="space-y-4 pt-6">
          {uiError ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {uiError}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error instanceof Error ? error.message : "No se pudo cargar la lista de usuarios."}
            </p>
          ) : null}

          {isLoading ? (
            <TableSkeleton columns={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.nombre}</TableCell>
                    <TableCell>{user.correo}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      {(user.activo ?? true) ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                          Activo
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                          Inactivo
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => openEditDialog(user.id)}
                          size="sm"
                          variant="outline"
                        >
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDeactivate(user.id)}
                          size="sm"
                          variant="destructive"
                          disabled={deactivateUserMutation.isPending || !(user.activo ?? true)}
                        >
                          Desactivar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedUserId("");
            setDraftRole(null);
            setDraftActivo(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Ajusta rol y estado del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>

          {loadingSelectedUser ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : selectedUserError ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {selectedUserError instanceof Error
                ? selectedUserError.message
                : "No se pudo cargar el detalle del usuario."}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{selectedUserName}</p>
                <p className="text-xs text-muted-foreground">{selectedUser?.correo}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol-user">Rol</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setDraftRole(value as Role)}
                >
                  <SelectTrigger id="rol-user">
                    <SelectValue placeholder="Selecciona rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado-user">Estado</Label>
                <Select
                  value={selectedActivo ? "activo" : "inactivo"}
                  onValueChange={(value) => setDraftActivo(value === "activo")}
                >
                  <SelectTrigger id="estado-user">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={closeEditDialog}
              variant="outline"
              disabled={updateUserMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                updateUserMutation.isPending ||
                loadingSelectedUser ||
                Boolean(selectedUserError)
              }
            >
              {updateUserMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setCreateForm(EMPTY_CREATE_FORM);
            setCreateError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear usuario interno</DialogTitle>
            <DialogDescription>
              Solo para roles del comité (secretaría, coordinador, evaluador, administrador).
              Los estudiantes e investigadores se registran por su cuenta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-nombre">Nombre</Label>
                <Input
                  id="create-nombre"
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm((f) => ({ ...f, nombre: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-apellido">Apellido</Label>
                <Input
                  id="create-apellido"
                  value={createForm.apellido}
                  onChange={(e) => setCreateForm((f) => ({ ...f, apellido: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-email">Correo institucional</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-password">Contraseña</Label>
              <Input
                id="create-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-rol">Rol</Label>
              <Select
                value={createForm.rol}
                onValueChange={(value) =>
                  setCreateForm((f) => ({ ...f, rol: value as InternalRole }))
                }
              >
                <SelectTrigger id="create-rol">
                  <SelectValue placeholder="Selecciona rol" />
                </SelectTrigger>
                <SelectContent>
                  {INTERNAL_ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {createError ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {createError}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setCreateOpen(false)}
              variant="outline"
              disabled={createUserMutation.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Creando..." : "Crear usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
