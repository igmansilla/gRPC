import { LitElement, html, css } from "https://cdn.skypack.dev/lit";

class TiendasComponent extends LitElement {
  static get properties() {
    return {
      tiendas: { type: Array },
      nuevaTienda: { type: Object },
      editIndex: { type: Number }, 
      editTienda: { type: Object },
    };
  }

  constructor() {
    super();
    this.tiendas = [];
    this.nuevaTienda = {
      codigo: "",
      direccion: "",
      ciudad: "",
      provincia: "",
      habilitada: false,
      producto_ids: [],
    };
    this.editIndex = -1; 
    this.editTienda = {}; 
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadTiendas();
  }

  async loadTiendas() {
    try {
      const response = await fetch("/listTiendas");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      this.tiendas = (await response.json())?.tiendas;
    } catch (error) {
      console.error("Error al cargar las tiendas:", error);
    }
  }

 
  async createTienda() {
    try {
      const response = await fetch("/createTienda", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.nuevaTienda),
      });
      if (!response.ok) throw new Error("Error al crear la tienda");
      await this.loadTiendas();
      this.nuevaTienda = {
        codigo: "",
        direccion: "",
        ciudad: "",
        provincia: "",
        habilitada: false,
        producto_ids: [],
      }; 
    } catch (error) {
      console.error("Error al crear la tienda:", error);
    }
  }

  
  async updateTienda(tienda) {
    try {
      const response = await fetch(`/updateTienda/${tienda.codigo}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tienda),
      });
      if (!response.ok) throw new Error("Error al actualizar la tienda");
      await this.loadTiendas();
    } catch (error) {
      console.error("Error al actualizar la tienda:", error);
    }
  }

  
  async deleteTienda(codigo) {
    try {
      const response = await fetch(`/deleteTienda/${codigo}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar la tienda");
      await this.loadTiendas(); 
    } catch (error) {
      console.error("Error al eliminar la tienda:", error);
    }
  }
  
  editMode(index) {
    this.editIndex = index;
    this.editTienda = { ...this.tiendas[index] }; 
  }

  
  cancelEdit() {
    this.editIndex = -1; 
    this.editTienda = {}; 
  }

  
  async saveTienda() {
    try {
      const response = await fetch(`/updateTienda/${this.editTienda.codigo}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.editTienda),
      });
      if (!response.ok) throw new Error("Error al actualizar la tienda");

      this.tiendas[this.editIndex] = { ...this.editTienda }; 
      this.cancelEdit();
      await this.loadTiendas(); 
    } catch (error) {
      console.error("Error al actualizar la tienda:", error);
    }
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
    input {
      width: 100%;
      padding: 4px;
    }
  `;

  render() {
    return html`
      <h2>Lista de Tiendas</h2>

     
      <form
        @submit=${(e) => {
          e.preventDefault();
          this.createTienda();
        }}
      >
        <input
          type="text"
          .value=${this.nuevaTienda.codigo}
          @input=${(e) => (this.nuevaTienda.codigo = e.target.value)}
          placeholder="Código"
          required
        />
        <input
          type="text"
          .value=${this.nuevaTienda.direccion}
          @input=${(e) => (this.nuevaTienda.direccion = e.target.value)}
          placeholder="Dirección"
          required
        />
        <input
          type="text"
          .value=${this.nuevaTienda.ciudad}
          @input=${(e) => (this.nuevaTienda.ciudad = e.target.value)}
          placeholder="Ciudad"
          required
        />
        <input
          type="text"
          .value=${this.nuevaTienda.provincia}
          @input=${(e) => (this.nuevaTienda.provincia = e.target.value)}
          placeholder="Provincia"
          required
        />
        <label>
          <input
            type="checkbox"
            .checked=${this.nuevaTienda.habilitada}
            @change=${(e) => (this.nuevaTienda.habilitada = e.target.checked)}
          />
          Habilitada
        </label>
        <button type="submit">Crear Tienda</button>
      </form>

      ${this.tiendas?.length > 0
        ? html`
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Dirección</th>
                  <th>Ciudad</th>
                  <th>Provincia</th>
                  <th>Habilitada</th>
                  <th>Productos Asociados</th>
                </tr>
              </thead>
              <tbody>
                ${this.tiendas.map(
                  (tienda, index) => html`
                    <tr>
                      
                      ${this.editIndex === index
                        ? html`
                            <td>
                              <input
                                type="text"
                                .value=${this.editTienda.codigo}
                                @input=${(e) =>
                                  (this.editTienda.codigo = e.target.value)}
                                disabled
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                .value=${this.editTienda.direccion}
                                @input=${(e) =>
                                  (this.editTienda.direccion = e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                .value=${this.editTienda.ciudad}
                                @input=${(e) =>
                                  (this.editTienda.ciudad = e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                .value=${this.editTienda.provincia}
                                @input=${(e) =>
                                  (this.editTienda.provincia = e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                .checked=${this.editTienda.habilitada}
                                @change=${(e) =>
                                  (this.editTienda.habilitada =
                                    e.target.checked)}
                              />
                              ${this.editTienda.habilitada
                                ? "Habilitada"
                                : "Deshabilitada"}
                            </td>
                            <td>
                              <input
                                type="text"
                                .value=${this.editTienda.producto_ids.join(
                                  ", "
                                )}
                                @input=${(e) =>
                                  (this.editTienda.producto_ids =
                                    e.target.value.split(", "))}
                              />
                            </td>
                            <td>
                              <button @click=${() => this.saveTienda()}>
                                Guardar
                              </button>
                              <button @click=${() => this.cancelEdit()}>
                                Cancelar
                              </button>
                            </td>
                          `
                        : html`
                           
                            <td>${tienda.codigo}</td>
                            <td>${tienda.direccion}</td>
                            <td>${tienda.ciudad}</td>
                            <td>${tienda.provincia}</td>
                            <td>
                              ${tienda.habilitada
                                ? "Habilitada"
                                : "Deshabilitada"}
                            </td>
                            <td>${tienda.producto_ids.join(", ")}</td>
                            <td>
                              <button @click=${() => this.editMode(index)}>
                                Editar
                              </button>
                              <button
                                @click=${() => this.deleteTienda(tienda.codigo)}
                              >
                                Eliminar
                              </button>
                            </td>
                          `}
                    </tr>
                  `
                )}
              </tbody>
            </table>
          `
        : html`<p>Cargando tiendas...</p>`}
    `;
  }
}

customElements.define("lit-tiendas", TiendasComponent);
