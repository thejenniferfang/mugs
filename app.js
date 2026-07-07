const grid = document.getElementById("grid");
const brandList = document.getElementById("brand-list");
const searchInput = document.getElementById("search");
const countEl = document.getElementById("count");

const state = { brand: "all", sort: "default", query: "" };

// price string like "$38" or "~$45" -> number for sorting
function priceNum(mug) {
  const m = String(mug.price || "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : Infinity;
}

function brands() {
  return [...new Set(MUGS.map((m) => m.brand))];
}

function buildBrandFilters() {
  brands().forEach((brand) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.brand = brand;
    btn.textContent = brand;
    li.appendChild(btn);
    brandList.appendChild(li);
  });
}

function visibleMugs() {
  let list = MUGS.slice();
  if (state.brand !== "all") list = list.filter((m) => m.brand === state.brand);
  if (state.query) {
    const q = state.query.toLowerCase();
    list = list.filter((m) =>
      (m.name + " " + m.brand).toLowerCase().includes(q)
    );
  }
  if (state.sort === "brand") {
    list.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
  } else if (state.sort === "price-asc") {
    list.sort((a, b) => priceNum(a) - priceNum(b));
  } else if (state.sort === "price-desc") {
    list.sort((a, b) => priceNum(b) - priceNum(a));
  }
  return list;
}

function render() {
  const list = visibleMugs();
  grid.innerHTML = "";

  if (!list.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No mugs match. Try another search.";
    grid.appendChild(p);
  }

  list.forEach((mug) => {
    const a = document.createElement("a");
    a.className = "mug";
    a.href = mug.productUrl || "#";
    a.target = "_blank";
    a.rel = "noopener";

    const wrap = document.createElement("div");
    wrap.className = "mug-img-wrap";
    const img = document.createElement("img");
    img.src = "cutouts/" + mug.file.replace(/\.\w+$/, ".png");
    img.alt = mug.brand + " " + mug.name;
    img.decoding = "async";
    wrap.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "mug-meta";
    meta.innerHTML =
      '<div class="mug-name"></div><div class="mug-brand"></div><div class="mug-price"></div>';
    meta.querySelector(".mug-name").textContent = mug.name;
    meta.querySelector(".mug-brand").textContent = mug.brand;
    meta.querySelector(".mug-price").textContent = mug.price || "";

    a.appendChild(wrap);
    a.appendChild(meta);
    grid.appendChild(a);
  });

  countEl.textContent = list.length + " mug" + (list.length === 1 ? "" : "s");
}

const brandValue = document.getElementById("brand-value");
const sortValue = document.getElementById("sort-value");

function closeGroup(group) {
  group.classList.remove("open");
  group.querySelector(".group-toggle").setAttribute("aria-expanded", "false");
}

document.addEventListener("click", (e) => {
  // expand/collapse a filter group
  const toggle = e.target.closest(".group-toggle");
  if (toggle) {
    const group = toggle.closest(".filter-group");
    const open = group.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    return;
  }

  const brandBtn = e.target.closest(".filter-btn");
  if (brandBtn) {
    state.brand = brandBtn.dataset.brand;
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.toggle("is-active", b === brandBtn));
    brandValue.textContent = brandBtn.textContent;
    closeGroup(document.getElementById("group-brands"));
    render();
    return;
  }

  const sortBtn = e.target.closest(".sort-btn");
  if (sortBtn) {
    state.sort = sortBtn.dataset.sort;
    document.querySelectorAll(".sort-btn").forEach((b) => b.classList.toggle("is-active", b === sortBtn));
    sortValue.textContent = sortBtn.textContent;
    closeGroup(document.getElementById("group-sort"));
    render();
  }
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value.trim();
  render();
});

buildBrandFilters();
render();
