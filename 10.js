#!/usr/bin/env node
const minimist = require("minimist");
const childProcess = require("child_process");
const config = require("./config.json");
const args = minimist(process.argv.slice(2));
const vmid = args._[0];
if (!vmid) {
  throw new Error("No vmid specified");
}
const vmname = args.name;
const disk = args.disk || config.disk;
const img10 = args["img10"] || config.img10;
const diskCapacity = config.diskCapacity || 64;

const isBekijou = (x) => {
  if (x === 0) return false
  return (x & (x - 1)) == 0;
}

const cores = args.cores || config.cores || 4;
if (!isBekijou(cores)) {
  throw new Error(`${cores} is not exponentiation of 2`)
}
const memory = args.memory || config.memory || 4096;
const openCore = "OpenCore-v18.iso";
const isoDisk = config.isoDisk || "hdd";
const osk = config.osk;

const ex = childProcess.execSync(`qm create ${vmid}${vmname ? ` --name ${vmname}`:""} --ide2 ${isoDisk}:iso/${openCore},cache=unsafe,size=150M --ostype other --vga vmware --machine q35 --bios ovmf --scsihw virtio-scsi-pci --agent 1 --efidisk0 ${disk}:1,efitype=4m,pre-enrolled-keys=0 --sockets 1 --cores ${cores} --numa 0 --cpu Penryn --memory ${memory} --sata0 ${disk}:${diskCapacity},discard=on,cache=unsafe --balloon 0 --net0 vmxnet3,bridge=vmbr0,firewall=1 --ide0 ${isoDisk}:iso/${img10},cache=unsafe,size=14G --tablet 1 --args '-device isa-applesmc,osk="${osk}" -smbios type=2 -device usb-kbd,bus=ehci.0,port=2 -global nec-usb-xhci.msi=off -global ICH9-LPC.acpi-pci-hotplug-with-bridge-support=off ${config.cpu === "intel" ? "-cpu host,kvm=on,vendor=GenuineIntel,+kvm_pv_unhalt,+kvm_pv_eoi,+hypervisor,+invtsc":"-cpu Penryn,kvm=on,vendor=GenuineIntel,+kvm_pv_unhalt,+kvm_pv_eoi,+hypervisor,+invtsc,+pcid,+ssse3,+sse4.2,+popcnt,+avx,+avx2,+aes,+fma,+fma4,+bmi1,+bmi2,+xsave,+xsaveopt,+rdrand,check"}' --boot order=ide2`);
console.log(ex.toString());