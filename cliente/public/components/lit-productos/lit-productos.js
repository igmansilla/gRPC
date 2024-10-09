import { LitElement, html, css } from "https://cdn.skypack.dev/lit";

class ProductosComponent extends LitElement {
  static get properties() {
    return {
      productos: { type: Array },
      editIndex: { type: Number },
      editProducto: { type: Object }, 
      nuevoProducto: { type: Object },
    };
  }

  constructor() {
    super();
    this.productos = [];
    this.editIndex = -1;
    this.editProducto = {};
    this.nuevoProducto = {
      nombre: "",
      codigo: "",
      talle: "",
      foto: "",
      color: "",
      tienda_ids: [],
    };
  }

  
  async createProducto() {
    try {
      const response = await fetch("/createProducto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.nuevoProducto),
      });
      if (!response.ok) throw new Error("Error al crear el producto");
      await this.loadProductos(); 
      this.nuevoProducto = {
        nombre: "",
        codigo: "",
        talle: "",
        foto: "",
        color: "",
        tienda_ids: [],
      }; 
      console.log(this.nuevoProducto);
    } catch (error) {
      console.error("Error al crear el producto:", error);
    }
  }

  async deleteProducto(id) {
    debugger;
    try {
      const response = await fetch(`/deleteProducto/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar el producto");
      await this.loadProductos(); 
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  }

  
  editMode(index) {
    this.editIndex = index;
    this.editProducto = { ...this.productos[index] }; 
  }

 
  cancelEdit() {
    this.editIndex = -1;
    this.editProducto = {};
  }

  
  async saveProducto() {
    debugger
    try {
      const response = await fetch(
        `/updateProducto/${this.editProducto.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.editProducto),
        }
      );
      if (!response.ok) throw new Error("Error al actualizar el producto");

      this.productos[this.editIndex] = { ...this.editProducto };
      this.cancelEdit(); 
      await this.loadProductos(); 
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadProductos();
  }

  async loadProductos() {
    try {
      const response = await fetch("/listProductos");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      this.productos = (await response.json())?.productos;
    } catch (error) {
      console.error("Error al cargar los productos:", error);
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
    input,
    textarea {
      width: 100%;
      padding: 4px;
      margin-bottom: 10px;
    }
  `;

  render() {
    return html`
      <h2>Lista de Productos</h2>

      
      <form
        @submit=${(e) => {
          e.preventDefault();
          this.createProducto();
        }}
      >
        <input
          type="text"
          .value=${this.nuevoProducto.nombre}
          @input=${(e) => (this.nuevoProducto.nombre = e.target.value)}
          placeholder="Nombre"
          required
        />
        <input
          type="text"
          .value=${this.nuevoProducto.codigo}
          @input=${(e) => (this.nuevoProducto.codigo = e.target.value)}
          placeholder="Código"
          required
        />
        <input
          type="text"
          .value=${this.nuevoProducto.talle}
          @input=${(e) => (this.nuevoProducto.talle = e.target.value)}
          placeholder="Talle"
        />
        <input
          type="text"
          .value=${this.nuevoProducto.foto}
          @input=${(e) => (this.nuevoProducto.foto = e.target.value)}
          placeholder="URL de la foto"
        />
        <input
          type="text"
          .value=${this.nuevoProducto.color}
          @input=${(e) => (this.nuevoProducto.color = e.target.value)}
          placeholder="Color"
        />
        <textarea
          placeholder="Tiendas Asociadas (separadas por comas)"
          .value=${this.nuevoProducto.tienda_ids.join(", ")}
          @input=${(e) =>
            (this.nuevoProducto.tienda_ids = e.target.value.split(", "))}
        ></textarea>
        <button type="submit">Crear Producto</button>
      </form>

      ${this.productos?.length > 0
        ? html`
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Talle</th>
                  <th>Foto</th>
                  <th>Color</th>
                  <th>Tiendas Asociadas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${this.productos.map(
                  (producto, index) => html`
                    <tr>
                      <td>
                        ${this.editIndex === index
                          ? html`<input
                              type="text"
                              .value=${this.editProducto.nombre}
                              @input=${(e) =>
                                (this.editProducto.nombre = e.target.value)}
                            />`
                          : producto.nombre}
                      </td>
                      <td>
                        ${this.editIndex === index
                          ? html`<input
                              type="text"
                              .value=${this.editProducto.codigo}
                              @input=${(e) =>
                                (this.editProducto.codigo = e.target.value)}
                              disabled
                            />`
                          : producto.codigo}
                      </td>
                      <td>
                        ${this.editIndex === index
                          ? html`<input
                              type="text"
                              .value=${this.editProducto.talle}
                              @input=${(e) =>
                                (this.editProducto.talle = e.target.value)}
                            />`
                          : producto.talle || "N/A"}
                      </td>
                      <td>
                        ${this.editIndex === index
                          ? html`<input
                              type="text"
                              .value=${this.editProducto.foto}
                              @input=${(e) =>
                                (this.editProducto.foto = e.target.value)}
                            />`
                          : producto.foto
                          ? html`<img
                              src="${producto.foto}"
                              alt="Foto"
                              width="50"
                            />`
                          : "No disponible"}
                      </td>
                      <td>
                        ${this.editIndex === index
                          ? html`<input
                              type="text"
                              .value=${this.editProducto.color}
                              @input=${(e) =>
                                (this.editProducto.color = e.target.value)}
                            />`
                          : producto.color || "N/A"}
                      </td>
                      <td>
                        ${this.editIndex === index
                          ? html`<textarea
                              .value=${this.editProducto.tienda_ids.join(", ")}
                              @input=${(e) =>
                                (this.editProducto.tienda_ids =
                                  e.target.value.split(", "))}
                            ></textarea>`
                          : producto.tienda_ids.join(", ")}
                      </td>
                      <td>
                        ${this.editIndex === index
                          ? html`
                              <button @click=${() => this.saveProducto()}>
                                Guardar
                              </button>
                              <button @click=${() => this.cancelEdit()}>
                                Cancelar
                              </button>
                            `
                          : html`
                              <button
                                @click=${() => this.deleteProducto(producto.id)}
                              >
                                Eliminar
                              </button>
                              <button @click=${() => this.editMode(index)}>
                                Editar
                              </button>
                            `}
                      </td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
          `
        : html`<p>Cargando productos...</p>`}
    `;
  }
}

customElements.define("lit-productos", ProductosComponent);
