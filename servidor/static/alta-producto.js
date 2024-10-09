import { LitElement, html, css } from "https://cdn.skypack.dev/lit";

class AltaProducto extends LitElement {
  static styles = css`
    h2 {
      text-align: center;
      color: #4caf50;
    }

    form {
      margin: 20px auto;
      padding: 20px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 600px;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 15px;
    }

    th,
    td {
      padding: 10px;
      vertical-align: top;
    }

    label {
      font-weight: bold;
      color: #333;
    }

    input[type="text"],
    input[type="number"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 16px;
      background-color: #fff;
    }

    input[type="text"]:focus,
    input[type="number"]:focus {
      outline: none;
      border-color: #4caf50;
      box-shadow: 0 0 5px rgba(76, 175, 80, 0.4);
    }

    button {
      padding: 10px 20px;
      font-size: 16px;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: #45a049;
    }

    td[colspan="2"] {
      text-align: center;
    }
  `;

  render() {
    return html`
      <h2>Alta de Producto</h2>
      <form id="alta-producto-form" @submit=${this._handleSubmit}>
        <table>
          <tr>
            <td><label for="codigo">Código:</label></td>
            <td><input type="text" id="codigo" required /></td>
          </tr>
          <tr>
            <td><label for="nombre">Nombre:</label></td>
            <td><input type="text" id="nombre" required /></td>
          </tr>
          <tr>
            <td><label for="talles">Talles:</label></td>
            <td>
              <select id="talles" required multiple>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </td>
          </tr>
          <tr>
            <td><label for="colores">Colores:</label></td>
            <td>
              <select id="colores" required multiple>
                <option value="rojo">Rojo</option>
                <option value="azul">Azul</option>
                <option value="verde">Verde</option>
                <option value="negro">Negro</option>
              </select>
            </td>
          </tr>
          <tr>
            <td><label for="urls">URLs:</label></td>
            <td>
              <select id="urls" required multiple>
                <option value="https://ejemplo1.com">
                  https://ejemplo1.com
                </option>
                <option value="https://ejemplo2.com">
                  https://ejemplo2.com
                </option>
                <option value="https://ejemplo3.com">
                  https://ejemplo3.com
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <label for="cantidad_stock_proveedor">Cantidad Stock:</label>
            </td>
            <td>
              <input
                type="number"
                id="cantidad_stock_proveedor"
                required
                min="0"
              />
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: center;">
              <button type="submit">Dar de alta producto</button>
            </td>
          </tr>
        </table>
      </form>
    `;
  }

  async _handleSubmit(event) {
    event.preventDefault();
    const codigo = this.shadowRoot.querySelector("#codigo").value;
    const nombre = this.shadowRoot.querySelector("#nombre").value;

    const talles = Array.from(
      this.shadowRoot.querySelector("#talles").selectedOptions
    ).map((option) => option.value);

    const colores = Array.from(
      this.shadowRoot.querySelector("#colores").selectedOptions
    ).map((option) => option.value);

    const urls = Array.from(
      this.shadowRoot.querySelector("#urls").selectedOptions
    ).map((option) => option.value);

    const cantidad_stock_proveedor = this.shadowRoot.querySelector(
      "#cantidad_stock_proveedor"
    ).value;

    const nuevoProducto = {
      codigo,
      nombre,
      talles,
      colores,
      urls,
      cantidad_stock_proveedor,
    };

    const response = await fetch("/alta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoProducto),
    });

    if (response.ok) {
      alert("Producto dado de alta exitosamente");
      this.dispatchEvent(new CustomEvent("producto-actualizado"));
      this.shadowRoot.querySelector("#alta-producto-form").reset();
    } else {
      alert("Error al dar de alta el producto");
    }
  }
}

customElements.define("alta-producto", AltaProducto);
