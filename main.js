// with thanks to https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#example_showing_files_size
const uploadInput = document.getElementById("uploadInput");
uploadInput.addEventListener(
  "change",
  () => handleFiles(uploadInput.files),
  false,
);

// with thanks to https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#selecting_files_using_drag_and_drop


function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  const dt = e.dataTransfer;
  const files = dt.files;

  handleFiles(files);
}


function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

async function init() {
  const preview = document.getElementById("preview");
  const opfsRoot = await navigator.storage.getDirectory();
  const directoryHandle = await opfsRoot.getDirectoryHandle("opfs-gallery", {
    create: true,
  });
  for await (let [name, handle] of directoryHandle) {
    previewImage(preview, await handle.getFile());
  }
}

async function handleFiles(files) {
  const opfsRoot = await navigator.storage.getDirectory();
  const directoryHandle = await opfsRoot.getDirectoryHandle("opfs-gallery", {
    create: true,
  });

  let numberOfBytes = 0;
  const preview = document.getElementById("preview");
  for (const file of files) {
    let writableFileStream;
    try {
      const nestedFileHandle = await directoryHandle.getFileHandle(
        file.name,
        { create: true },
      );
      writableFileStream = await nestedFileHandle.createWritable()
      await writableFileStream.write(file);
    } catch (e) {
      console.error('error storing file', file, e);
    } finally {
      if (writableFileStream) {
        writableFileStream.close();
      }
    }

    numberOfBytes += file.size;

    if (!file.type.startsWith("image/")) {
      continue;
    }

    
    previewImage(preview, file);
  }
  // Approximate to the closest prefixed unit
  const units = [
    "B",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];
  const exponent = Math.min(
    Math.floor(Math.log(numberOfBytes) / Math.log(1024)),
    units.length - 1,
  );
  const approx = numberOfBytes / 1024 ** exponent;
  const output =
    exponent === 0
      ? `${numberOfBytes} bytes`
      : `${approx.toFixed(3)} ${units[exponent]
      } (${numberOfBytes} bytes)`;

  document.getElementById("fileNum").textContent =
    uploadInput.files.length;
  document.getElementById("fileSize").textContent = output;
}

function previewImage(preview, file) {
  const figure = document.createElement("figure");
  const img = document.createElement("img");
  // img.classList.add("obj");
  img.file = file;
  const caption = document.createElement("figcaption");
  caption.textContent = file.name;
  figure.appendChild(img);
  figure.appendChild(caption);
  figure.classList.add("obj");
  preview.appendChild(figure); // Assuming that "preview" is the div output where the content will be displayed.

  const reader = new FileReader();
  reader.onload = (e) => {
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  // copilot might have had it right?
  // const reader = new FileReader();
  // reader.onload = function (e) {
  //   const img = new Image();
  //   img.src = e.target.result;
  //   // img.width = 100;
  //   // img.height = 100;
  //   document.getElementById("preview").appendChild(img);
  // };
  // reader.readAsDataURL(file);
}



let dropbox;

dropbox = document.getElementById("dropbox");
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);
dropbox.addEventListener('click', () => uploadInput.click(), false);

init();