import { LitElement, html, css } from "https://cdn.skypack.dev/lit";

class UsuariosComponent extends LitElement {
  static get properties() {
    return {
      usuarios: { type: Array },
      nuevoUsuario: { type: Object },
      editandoUsuario: { type: Boolean },
      usuarioAEditar: { type: Object },
    };
  }

  constructor() {
    super();
    this.usuarios = [];
    this.nuevoUsuario = {
      nombreUsuario: "",
      nombre: "",
      apellido: "",
      tienda_id: "",
      habilitado: false,
    };
    this.editandoUsuario = false; 
    this.usuarioAEditar = null;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadUsuarios();
  }

  
  async loadUsuarios() {
    try {
      const response = await fetch("/listUsuarios");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      this.usuarios = (await response.json())?.usuarios;
    } catch (error) {
      console.error("Error al cargar los usuarios:", error);
    }
  }

 
  async createUsuario() {
    try {
      const response = await fetch("/createUsuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.nuevoUsuario),
      });
      if (!response.ok) throw new Error("Error al crear el usuario");
      await this.loadUsuarios(); 
      this.resetFormulario(); 
    } catch (error) {
      console.error("Error al crear el usuario:", error);
    }
  }


  async deleteUsuario(id) {
    try {
      const response = await fetch(`/deleteUsuario/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar el usuario");
      await this.loadUsuarios(); 
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  }

  
  editarUsuario(usuario) {
    this.editandoUsuario = true;
    this.usuarioAEditar = { ...usuario };
    this.nuevoUsuario = { ...usuario }; 
  }

 
  async updateUsuario() {
    try {
      const response = await fetch(`/updateUsuario/${this.usuarioAEditar.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.nuevoUsuario),
      });
      if (!response.ok) throw new Error("Error al actualizar el usuario");
      await this.loadUsuarios(); 
      this.resetFormulario(); 
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }
  }

  resetFormulario() {
    this.nuevoUsuario = {
      nombreUsuario: "",
      nombre: "",
      apellido: "",
      tienda_id: "",
      habilitado: false,
    };
    this.editandoUsuario = false;
    this.usuarioAEditar = null;
  }

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      padding: 0.8rem;
      border: 1px solid #ddd;
      text-align: left;
    }
    th {
      background-color: #f4f4f4;
    }
    button {
      margin: 5px;
      padding: 5px 10px;
      cursor: pointer;
    }
    form {
      margin-bottom: 20px;
    }
    input,
    select {
      width: 100%;
      padding: 4px;
      margin-bottom: 10px;
    }
  `;

  render() {
    return html`
      <h2>${this.editandoUsuario ? "Editar Usuario" : "Crear Usuario"}</h2>

     
      <form
        @submit=${(e) => {
          e.preventDefault();
          this.editandoUsuario ? this.updateUsuario() : this.createUsuario();
        }}
      >
        <input
          type="text"
          .value=${this.nuevoUsuario.nombreUsuario}
          @input=${(e) => (this.nuevoUsuario.nombreUsuario = e.target.value)}
          placeholder="Nombre de Usuario"
          required
        />
        <input
          type="text"
          .value=${this.nuevoUsuario.nombre}
          @input=${(e) => (this.nuevoUsuario.nombre = e.target.value)}
          placeholder="Nombre"
          required
        />
        <input
          type="text"
          .value=${this.nuevoUsuario.apellido}
          @input=${(e) => (this.nuevoUsuario.apellido = e.target.value)}
          placeholder="Apellido"
          required
        />
        <input
          type="text"
          .value=${this.nuevoUsuario.tienda_id}
          @input=${(e) => (this.nuevoUsuario.tienda_id = e.target.value)}
          placeholder="Tienda ID"
        />
        <select
          ?value=${this.nuevoUsuario.habilitado}
          @change=${(e) =>
            (this.nuevoUsuario.habilitado = e.target.value === "true")}
        >
          <option value="false">No habilitado</option>
          <option value="true">Habilitado</option>
        </select>
        <button type="submit">
          ${this.editandoUsuario ? "Actualizar Usuario" : "Crear Usuario"}
        </button>
        ${this.editandoUsuario
          ? html`<button type="button" @click=${this.resetFormulario}>
              Cancelar
            </button>`
          : ""}
      </form>

      ${this.usuarios?.length > 0
        ? html`
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre de Usuario</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Tienda ID</th>
                  <th>Habilitado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${this.usuarios.map(
                  (usuario) => html`
                    <tr>
                      <td>${usuario.id}</td>
                      <td>${usuario.nombreUsuario}</td>
                      <td>${usuario.nombre}</td>
                      <td>${usuario.apellido}</td>
                      <td>${usuario.tienda_id}</td>
                      <td>${usuario.habilitado ? "Sí" : "No"}</td>
                      <td>
                        <button @click=${() => this.editarUsuario(usuario)}>
                          Editar
                        </button>
                        <button @click=${() => this.deleteUsuario(usuario.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
          `
        : html`<p>Cargando usuarios...</p>`}
    `;
  }
}

customElements.define("lit-usuarios", UsuariosComponent);
